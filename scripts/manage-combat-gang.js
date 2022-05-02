/** @type import(".").NS */
let ns = null;

const argsSchema = [
    ["c", false]
    ["defaulttask", ""]
]

const FACTION_NAME = "Slum Snakes";
const TASK_TRAIN = "Train Combat";
const TASK_VIGI = "Vigilante Justice";
const TASK_NOOB = String.fromCharCode(77) + "ug People";
const TASK_RESPECT = String.fromCharCode(84) + "errorism";
const TASK_MONEY = "Human " + String.fromCharCode(84) + "rafficking";
const TASK_WARFARE = "Territory Warfare";
const TASK_NULL = "Unassigned";
const TASK_MANUAL = "Manual/NotReallyTaskName";

const ASCEND_ON_MPL = 10;
const EQUIP_AFFORD_COEFF = 100;

const STATS_TRESHOLD = 0.7;
const STATS_MIN = 4000;
const STATS_HARD_MIN = 200;
const TRAIN_CHANCE = 0.2;
const RESPECT_MIN = 2e+6;

const WANTED_PENALTY_TRESHOLD = 0.99;
const WARFARE_TRESHOLD = 2;

const MEMBERS_MIN = 6;
const MEMBERS_MAX = 12;

const SLEEP_TIME = 10000;

const FIRST_NAMES = ["Jimmy", "Johnny", "Joey", "Billy", "Pat", "Freddy", "Willy", "Louis", "Luis", "Larry", "Pete", "Joe", "Sammy", "Bruno", "Burt", "Mike", "Mikey", "Armando", "Hector", "Harry"];
const NICK_NAMES = ["'Killer'", "'Shooter'", "'The Owl'", "'Lefty'", "'Whack-Whack'", "'The Chicken'", "'Horseface'", "'The Shark'", "'Squints'", "'Baldy'", "'Big Poppa''", "'The Gun'", "'Pistol'", "'Bullet'", "'Spider'", "'Joker'", "'Shorty'", "'Sniper'", "'Bouncer'", "'The Tank'"];
const LAST_NAMES = ["Johnson", "Nelson", "Rodriguez", "Jefferson", "Washington", "Smith", "Mcguire", "Malone", "Murphy", "Greene", "Fitzpatrick", "Hanhrahan", "Higgins", "Connolly", "Capone", "Luciano", "Marino", "Milano", "Palermo", "Schmidt"]

/** @param {NS} _ns **/
export async function main(_ns) {
    ns = _ns;
    const gang = ns.gang;

    function createGang(){
        if(gang.createGang(FACTION_NAME)){
            ns.toast("Gang created!","success")           
        } else {
            ns.tprintf("ERROR: unable to create new gang!");
        }
    }
    // Get weighted stats sum (at this moment, sum of combat stats in eq proportions) 
    function getStatsSum(member) {
        const info = gang.getMemberInformation(member);
        return info.str + info.def + info.dex + info.agi;
    }
    // Find the best gang power except our gang
    function maxEnemyPower(myGang) {
        const others = ns.gang.getOtherGangInformation();
        let maxPower = 0;
        for (let name in others) {
            if (name === myGang.faction) continue;
            maxPower = Math.max(maxPower, others[name].power);
        }
        return maxPower;
    }
    // Set a task or not to set (if manually overridden)
    const autoTasks = {}
    function setAutoTask(member, task) {
        const info = gang.getMemberInformation(member);
        const lastTask = info.task;
        // Manual task: stored task mismatches real task and not unassigned
        if (lastTask !== TASK_NULL && autoTasks.hasOwnProperty(member) && autoTasks[member] !== lastTask) {
            autoTasks[member] = TASK_MANUAL;
            return;
        }
        // Automatic task: set it if differs from real one
        autoTasks[member] = task;
        if (lastTask !== task) {
            gang.setMemberTask(member, task);
        }
    }
    function getRandomName(){
        let firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
        let nickName = NICK_NAMES[Math.floor(Math.random() * NICK_NAMES.length)];
        let lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
        return `${firstName} ${nickName} ${lastName}`;
    }
    // The script accepts argument for default task override (optional)
    let defaultTask = null;
    let options = ns.flags(argsSchema);
    if(options.c){
        createGang();
    }
    if (gang.getTaskNames().includes(options.defaulttask)) {
        defaultTask = options.defaulttask;
    }
    // Main loop
    for (; ;) {
        // Recruit any member possible 
        while (gang.canRecruitMember()) {
            gang.recruitMember(getRandomName());
        }
        let bestStats = STATS_MIN / STATS_TRESHOLD; // minimum
        const members = gang.getMemberNames();
        const info = gang.getGangInformation();
        // Ascend if good enough
        for (let member of members) {
            const r = gang.getAscensionResult(member);
            if (!r) continue;
            const mpl = r.agi * r.def * r.dex * r.str;
            if (mpl > ASCEND_ON_MPL) {
                gang.ascendMember(member);
                let msg = `Member ${member} ascended!`;
                ns.tprint(msg);
                ns.toast(msg);   
            }
        }
        // Purchase equipment 
        const allEquip = gang.getEquipmentNames();
        let money = ns.getServerMoneyAvailable('home');
        for (let equip of allEquip) {
            const cost = gang.getEquipmentCost(equip);
            const amount = money / cost;
            if (amount < EQUIP_AFFORD_COEFF) continue;
            for (let member of members) {
                const info = gang.getMemberInformation(member);
                if (info.upgrades.includes(equip) || info.augmentations.includes(equip)) continue;
                if (gang.purchaseEquipment(member, equip)) {
                    money -= cost;
                }
            }
        }
        // Find best stats
        for (let member of members) {
            let sum = getStatsSum(member);
            if (sum > bestStats) bestStats = sum;
        }
        // Check if we are powerful enough
        let powerfulEnough = info.power >= maxEnemyPower(info) * WARFARE_TRESHOLD;
        gang.setTerritoryWarfare(powerfulEnough);
        // Choose the default task for members
        let task = defaultTask;
        if (!defaultTask) {
            // If gang isn't full - gain respect
            if (members.length < MEMBERS_MAX) {
                task = (members.length < MEMBERS_MIN) ? TASK_NOOB : TASK_RESPECT;
            } else {
                // if respect too low - gain it first, power second, money last
                if (info.respect < RESPECT_MIN) {
                    task = TASK_RESPECT;
                } else if (!powerfulEnough) {
                    task = TASK_WARFARE;
                } else {
                    task = TASK_MONEY;
                }
            }
        }
        // Assign tasks
        for (let member of members) {
            let sum = getStatsSum(member);
            // Train members, not acceptable in 'noob mode'
            if (sum < STATS_HARD_MIN || (members.length >= MEMBERS_MIN && sum < bestStats * STATS_TRESHOLD)) {
                setAutoTask(member, TASK_TRAIN);
                continue;
            }
            // Vigi if wanted penalty too large
            if (info.wantedLevel > 2 && info.wantedPenalty < WANTED_PENALTY_TRESHOLD) {
                setAutoTask(member, TASK_VIGI);
                continue;
            }
            // Do the default task (autoselected or called with args[0])
            setAutoTask(member, Math.random() < TRAIN_CHANCE ? TASK_TRAIN : task);
        }
        await ns.sleep(SLEEP_TIME);
    }
}