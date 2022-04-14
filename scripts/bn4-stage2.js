import { formatMoney, getAllServers, log } from "helpers.js";
// Manage hacking server, get programs, and commit crimes to grow bad karma.
/** @type import(".").NS */
let ns = null;
const remote_spinup = 'infinity-remote-spinup.js';
const home = "home";
const timeout = 250; // In ms - too low of a time will result in a lockout/hang
const crimes = [
    "heist",
    "assassination",
    "kidnap",
    "grand theft auto",
    "homicide",
    "larceny",
    "mug someone",
    "rob store",
    "shoplift",
];
let crimesCommitted = 0;
let murders = 0;


/** @param {NS} _ns **/
export async function main(_ns) {
    ns = _ns;
    ns.disableLog("ALL")
    ns.tail(); // Open a window to view the status of the script        
    let hackLevel = ns.getHackingLevel();    
    crimesCommitted = 0;    
    murders = 0;
    ns.exec(remote_spinup, home);
    let lastRestartLevel = hackLevel;
    
    while (hackLevel < 1000) {
        hackLevel = ns.getHackingLevel();
        if (hackLevel < 100) {
            if (hackLevel % 10 == 0 & lastRestartLevel < hackLevel) {
                wl("Restarting all remote processes");
                await killAll();
                ns.exec(remote_spinup, home);
                lastRestartLevel = hackLevel;
            }
        } else {
            if (hackLevel % 100 == 0 & lastRestartLevel < hackLevel) {
                wl("Restarting all remote processes");
                await killAll();                
                ns.exec(remote_spinup, home);
                lastRestartLevel = hackLevel;
            }
        }
        await doSomeStuff();
        await ns.sleep(timeout);        
    }
    ns.toast("BN5 startup complete");
}

async function killAll() {
    let startingNode = "home";
    const serverList = getAllServers(ns);

    // Send the kill command to all servers
    for (const server of serverList) {
        // skip if this host, we save it for last
        if (server == startingNode)
            continue;

        // skip if not running anything
        if (ns.ps(server) === 0)
            continue;

        // kill all scripts
        ns.killall(server);
    }

    // idle for things to die
    for (const server of serverList) {
        // skip if this host, we save it for last
        if (server == startingNode)
            continue;
        // idle until they're dead, this is to avoid killing the cascade before it's finished.
        while (ns.ps(server) > 0) {
            await ns.sleep(20);
        }
    }
}

async function doSomeStuff() {
    if (ns.isBusy()) {
        // If player is already doing something return
        return;
    }
    let me = ns.getPlayer();
    let myMoney = ns.getServerMoneyAvailable(home);

    // If we have enough money buy available programs.
    if (myMoney > 250000000) {
        let p = getProgramToBuy()
        if (p) {
            wl(`Buying ${p}.`);            

            if (ns.purchaseProgram(p.toLowerCase())) {
                await ns.sleep(timeout);
            } else {
                wl("Failed to by program!!!!!")
                await ns.sleep(timeout*10);
            }
        }
    } 

    // make programs if we can.
    let program = getProgramToCreate();    
    if (program != "") {       
        wl(`Creating ${program}`);
        ns.createProgram(program);        
        return;
    }

    if (me.numPeopleKilled < 18000) {
        commitNextCrime();
    }
}

// Get program to create, or 
function getProgramToCreate() {
    let hackLevel = ns.getHackingLevel();        
    if (!ns.fileExists("AutoLink.exe") && hackLevel >= 25) {
        return "AutoLink.exe"
    }
    else if (!ns.fileExists("BruteSSH.exe") && hackLevel >= 50) {
        return "BruteSSH.exe"
    }
    if (!ns.fileExists("DeepscanV1.exe") && hackLevel >= 75) {
        return "DeepscanV1.exe"
    }
    if (!ns.fileExists("FTPCrack.exe") && hackLevel >= 100) {
        return "FTPCrack.exe"
    }
    if (!ns.fileExists("ServerProfiler.exe") && hackLevel >= 75) {
        return "ServerProfiler.exe"
    }
    if (!ns.fileExists("relaySMTP.exe") && hackLevel >= 250) {
        return "relaySMTP.exe"
    }
    if (!ns.fileExists("DeepscanV2.exe") && hackLevel >= 400) {
        return "DeepscanV2.exe"
    }
    if (!ns.fileExists("HTTPWorm.exe") && hackLevel >= 500) {
        return "HTTPWorm.exe"
    }
    if (!ns.fileExists("SQLInject.exe") && hackLevel >= 750) {
        return "SQLInject.exe"
    }    
    return "";
}

function getProgramToBuy() {

    if (!ns.fileExists("BruteSSH.exe", "home")) {
        return "BruteSSH.exe"
    }
    if (!ns.fileExists("SQLInject.exe", "home")) {
        return "SQLInject.exe"
    }
    if (!ns.fileExists("HTTPWorm.exe", "home")) {
        return "HTTPWorm.exe"
    }
    if (!ns.fileExists("DeepscanV2.exe", "home")) {
        return "DeepscanV2.exe"
    }
    if (!ns.fileExists("relaySMTP.exe", "home")) {
        return "relaySMTP.exe"
    }
    if (!ns.fileExists("ServerProfiler.exe", "home")) {
        return "ServerProfiler.exe"
    }
    if (!ns.fileExists("DeepscanV1.exe", "home")) {
        return "DeepscanV1.exe"
    }
    if (!ns.fileExists("FTPCrack.exe", "home")) {
        return "FTPCrack.exe"
    }
    if (!ns.fileExists("AutoLink.exe", "home")) {
        return "BruteSSH.exe"
    }
    return "";
}

function commitNextCrime() {
    /** Calculate the risk value of all crimes */
    let choices = crimes.map((crime) => {
        let p = ns.getPlayer();
        let crimeStats = ns.getCrimeStats(crime); // Let us look at the important bits            
        let crimeChance = ns.getCrimeChance(crime); // We need to calculate if its worth it            
        /** Using probabilty(odds) to calculate the "risk" to get the best reward
         *      Risk Value = Money Earned * Odds of Success(P(A) / ~P(A)) / Time taken
         *
         *  Larger risk values indicate a better choice
         */
        let crimeRiskValue =
            (crimeStats.money * Math.log10(crimeChance / (1 - crimeChance + Number.EPSILON))) /
            crimeStats.time;
        return [crime, crimeRiskValue];
    });

    let bestCrime = choices.reduce((prev, current) => {
        return prev[1] > current[1] ? prev : current;
    });
    commitCrime(bestCrime[0]);
}

function commitCrime(crime) {
    let mult = ns.getBitNodeMultipliers();
    
    ns.commitCrime(crime);
    crimesCommitted++;
    if (crime == "homicide") {
        murders++;
    }
    let stats = ns.getCrimeStats(crime);
    let player = ns.getPlayer();
    ns.clearLog();
    if (crime != "homicide") {
        let ch = ns.getCrimeChance("homicide");
        ns.printf("Murder chance: %f", ch);
    }
    ns.printf("Crimes comitted this session: %d", crimesCommitted);
    ns.printf("Homicides attempted this session: %d", murders);
    ns.printf("Kills: %d", player.numPeopleKilled);
    ns.print(
        `Crime: ${crime} Cash to Earn: ${formatMoney(stats.money * mult.CrimeMoney)}`
    );
}

function wl(s){
    log(ns, s);
}