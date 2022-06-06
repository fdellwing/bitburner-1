import {getBitnodeState, saveBitnodeState, doDarkWebBusiness} from "./bn12-lib";
import {log} from "./helpers";

const PHASE1_STATE="Temp/bn12-phase1"
const trainStats = ['strength', 'defense', 'dexterity', 'agility'];
const gym = "Powerhouse Gym";
const MIN_STR = 105;
const MIN_DEF = 105;
const MIN_DEX = 100;
const MIN_AGI = 100;
const GANG_THRESHOLD = -54000;
const GANG_FACTION_NAME = "Slum Snakes";
const BB_FACTION_NAME = "Bladeburner";
const REMOTE_HACKING_SCRIPT = "infinity-remote-spinup.js";

const Phase1Steps = {
    None: 0,
    WorkOut: 1,
    GrowBadKarma: 2,
    GetTheStuff: 4,
    InstallAugmentations: 5
}

/** @type import(".").NS */
let ns = null;

/** @type {PhaseState} **/
let phaseState;
let crimesCommitted = 0;
let murders = 0;

/** @param {NS} _ns **/
export async function main(_ns) {
    ns = _ns;

    let bitnodeState = await getBitnodeState(ns);
    if(bitnodeState.phase === 0){
        bitnodeState.phase = 1;
        await  saveBitnodeState(ns, bitnodeState);
        phaseState = new PhaseState();
        await savePhaseState();
    } else {
        let ps = await ns.read(PHASE1_STATE);
        phaseState = JSON.parse(ps);
    }

    // noinspection InfiniteLoopJS
    for(;;){
        switch (phaseState.currentStep){
            case Phase1Steps.None:
                await stepOne();
                break;
            case Phase1Steps.WorkOut:
                await stepTwo();
                break;
            case Phase1Steps.GrowBadKarma:
                await stepThree();
                break;
            case Phase1Steps.GetTheStuff:
                await stepFour();
                break;
            case Phase1Steps.InstallAugmentations:
                installAndStartPhase2();
                break;
        }
    }

}

/** @param {NS} ns **/
function PhaseState(ns){
    this.currentStep = 0;
    this.torPurchased = false;
    this.darkwebProgramsPurchased = false;
    this.purchasesAugmentations = [];
    this.sleevesRecoveredFromShock = false;
    this.homeRAM = ns.getServer("home").maxRam;
    this.lastRemoteSpinupHackLevel = -1;
    this.isFuckingJoesGuns = false;
}

async function savePhaseState(){
    await ns.write(PHASE1_STATE, JSON.stringify(phaseState), "w");
}

/**
 *  Start selling hashes
 *  Set all sleeves to work out at powerhouse gym
 *  Set main to working out.
 * @returns {Promise<void>}
 */
async function stepOne(){
    log(ns,"Selling hashes.", true);
    ns.run("hacknet.js", 1, "-c");
    for(let i = 0; i < ns.sleeve.getNumSleeves(); i++){
        let stat = trainStats[i % 4];
        ns.sleeve.setToGymWorkout(i, gym, stat);
        log(ns,`Sleeve #${i} set to workout ${stat} at ${gym}`, true);
    }
    phaseState.currentStep = Phase1Steps.WorkOut;
    await savePhaseState();
}

/**
 * Set main to working out at power gym to increase each combat skill to 100
 *
 * Join the blade burner division
 *
 * Set all sleeves to committing homicide
 * @returns {Promise<void>}
 */
async function stepTwo(){
    let notDone = true;
    let currentStat = -1;
    while(notDone){
        let stat = getStatNumberToWorkout();
        if(stat === -1){
            notDone = false;
            continue
        }
        if(stat !== currentStat){
            let ts = trainStats[stat];
            ns.gymWorkout(gym, ts, true);
            log(ns,`Set main to workout ${ts} at ${gym}`, true);
        }
        await ns.sleep(3000);
    }
    ns.bladeburner.joinBladeburnerDivision();
    for(let i = 0; i < ns.sleeve.getNumSleeves(); i++){
        let stat = trainStats[i % 4];
        ns.sleeve.setToCommitCrime(i,"homicide");
        log(ns,`Sleeve #${i} set to commit homicide`, true);
    }
    phaseState.currentStep = Phase1Steps.GrowBadKarma;
    await savePhaseState();
}

function getStatNumberToWorkout(){
    let player = ns.getPlayer();
    if(player.strength < MIN_STR)
        return 0;
    if(player.defense < MIN_DEF)
        return 1;
    if(player.dexterity < MIN_DEX)
        return 2;
    if(player.agility < MIN_AGI)
        return 3;
    return -1;
}

/**
 * Set main to committing homicide
 *
 * When at -54000 karma create the gang.
 *
 * Start bladeburner script
 *
 * Start gang management script.
 */
async function stepThree() {
    let notDone = true;
    let timeout = 250; // In ms - too low of a time will result in a lockout/hang
    let theCrime = "homicide";
    while(notDone) {
        await ns.sleep(timeout); // Wait it out first
        if (ns.isBusy()) continue;
        let karma = commitCrime(theCrime);
        if (karma < GANG_THRESHOLD) {
            notDone = false;
        }
    }

    // create gang and start managing
    createGang();
    ns.run("bn12-gang-management.js");
    // start bladeburner script
    ns.run("bn12-bladeburner-management.js",1);
    phaseState.currentStep = Phase1Steps.GetTheStuff;
    await savePhaseState();
}

function commitCrime(crime) {
    ns.commitCrime(crime);
    crimesCommitted++;
    if (crime === "homicide") {
        murders++;
    }
    let stats = ns.getCrimeStats(crime);
    let player = ns.getPlayer();
    ns.clearLog();
    ns.tail(); // just in case we accidentally close the window. We can only kill the script from the tail window.
    if (crime !== "homicide") {
        let ch = ns.getCrimeChance("homicide");
        ns.printf("Murder chance: %f", ch);
    }
    let karma = ns.heart.break();
    ns.printf("Crimes committed this session: %d", crimesCommitted);
    ns.printf("Murders this session: %d", murders);
    ns.printf("Kills: %d", player.numPeopleKilled);
    ns.printf("Karma: %d", karma);
    ns.print(
        `Crime: ${crime} Cash to Earn: \$${stats.money.toPrecision(4)}`
    );
    return karma;
}

function createGang(){
    if(ns.gang.createGang(GANG_FACTION_NAME)){
        ns.toast("Gang created!","success")
        log(ns,"SUCCESS: Combat gang created!")
    } else {
        ns.tprintf("ERROR: unable to create new gang! This is bad. We cannot continue!!!");
        ns.exit();
    }
}

/**
 * set sleeves to shock recovery
 *
 * @returns {Promise<void>}
 */
async function stepFour(){
    // Set all sleeves to recover from shock
    for(let i = 0; i < ns.sleeve.getNumSleeves(); i++){
        ns.sleeve.setToShockRecovery(i);
        log(ns,`Sleeve #${i} set to shock recovery`, true);
    }
    let bbAugs = ["The Blade's Simulacrum", "EsperTech Bladeburner Eyewear", "EMS-4 Recombination"];


    while(!gotAllMyShit()){
        await checkSleeveShockLevels();
        await spinUpRemoteHacks();
        if(!phaseState.isFuckingJoesGuns){
            await fuckJoesGuns();
        }
        let money = ns.getServerMoneyAvailable("home");
        if(!phaseState.torPurchased){
            if(money >= 500_000_000){
                doDarkWebBusiness(ns);
                phaseState.torPurchased = true;
                phaseState.darkwebProgramsPurchased = true
                await savePhaseState();
                log(ns, "SUCCESS: purchase darkweb programs!", true);
                money = ns.getServerMoneyAvailable("home");
            }
        } else if (this.homeRAM < 1024) {
            if(money >= ns.getUpgradeHomeRamCost()){
                ns.upgradeHomeRam();
                this.homeRAM = ns.getServer("home").maxRam;
                log(ns, `SUCCESS: Memory upgraded to ${this.homeRAM}!`, true);
                if(this.homeRAM >= 1024){
                    ns.run("bn12-stock-management.js", 1);
                    log(ns, `SUCCESS: Running stock manager`, true);
                }
            }
        } else {
            // now we need to purchase augmentations
            if(bbAugs.length > 0){
                let result = await tryBuyAugmentation(bbAugs[0]);
                if(result){
                    phaseState.purchasesAugmentations.push(bbAugs.pop());
                    await savePhaseState();
                }
            }
        }

        await ns.sleep(1000);
    }
    phaseState.currentStep = Phase1Steps.InstallAugmentations;
    await savePhaseState();
}

function gotAllMyShit(){
    let player = ns.getPlayer();
    let stonksUp = player.has4SData && player.has4SDataTixApi;
    return phaseState.torPurchased &&
        phaseState.darkwebProgramsPurchased &&
        this.homeRAM > 512 &&
        stonksUp &&
        phaseState.purchasesAugmentations.includes("The Blade's Simulacrum") &&
        phaseState.purchasesAugmentations.includes("EsperTech Bladeburner Eyewear") &&
        phaseState.purchasesAugmentations.includes("EMS-4 Recombination") &&
        phaseState.sleevesRecoveredFromShock;
}

function installAndStartPhase2(){
    log(ns,"SUCCESS: Phase 1 complete! Installing augmentations and starting phase 2.");
    ns.installAugmentations("bn12-phase2.js");
}

async function spinUpRemoteHacks(){
    let player = ns.getPlayer();
    if(phaseState.lastRemoteSpinupHackLevel === -1 || player.hacking - phaseState.lastRemoteSpinupHackLevel >= 50){
        log(ns,"Doing some remote spinup!")
        ns.run(REMOTE_HACKING_SCRIPT,1);
        phaseState.lastRemoteSpinupHackLevel = player.hacking;
        await savePhaseState();
    }
}

async function fuckJoesGuns() {
    let money = ns.getServerMoneyAvailable("home");
    if(money > 100_000_000){
        ns.run("fuck-joesguns.js");
        phaseState.isFuckingJoesGuns = true;
        await savePhaseState();
        log(ns,"SUCCESS: Joes Guns is fucked!");
    }
}

async function checkSleeveShockLevels(){
    for(let i = 0; i < ns.sleeve.getNumSleeves(); i++){
        if(ns.sleeve.getSleeveStats(i).shock > 0){
            return;
        }
    }
    phaseState.sleevesRecoveredFromShock = true;
    await savePhaseState();
}

async function tryBuyAugmentation(name){
    return ns.purchaseAugmentation(BB_FACTION_NAME, name);
}

