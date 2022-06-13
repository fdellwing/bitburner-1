import { getBitnodeState, saveBitnodeState, doDarkWebBusiness } from "./bn12-lib";
import { log } from "./helpers";

const PHASE1_STATE = "/Temp/bn12-phase1.txt"
const trainStats = ['strength', 'defense', 'dexterity', 'agility'];
const gym = "Powerhouse Gym";
const MIN_STR = 105;
const MIN_DEF = 105;
const MIN_DEX = 100;
const MIN_AGI = 100;
const GANG_THRESHOLD = -54000;
const GANG_FACTION_NAME = "Slum Snakes";
const BB_FACTION_NAME = "Bladeburners";
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
    ns.disableLog("ALL");
    ns.tail();
    log(ns, "Getting state...");
    let bitnodeStateText = await getBitnodeState(ns);
    log(ns,bitnodeStateText);

    let bitnodeState = JSON.parse(`${bitnodeStateText}`.trimEnd());

    if (bitnodeState.phase === 0) {
        bitnodeState.phase = 1;
        await saveBitnodeState(ns, bitnodeState);
        phaseState = new PhaseState(ns);
        await savePhaseState();
    } else {
        let ps = await ns.read(PHASE1_STATE);
        phaseState = JSON.parse(ps);
    }

    // noinspection InfiniteLoopJS
    for (; ;) {
        switch (phaseState.currentStep) {
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
                await installAndStartPhase2();
                break;
        }
    }
}

/** @param {NS} ns **/
function PhaseState(ns) {
    this.currentStep = 0;
    this.torPurchased = false;
    this.darkwebProgramsPurchased = false;
    this.purchasedAugmentations = [];
    this.requiredAugmentations = ["The Blade's Simulacrum", "EsperTech Bladeburner Eyewear", "EMS-4 Recombination"],
    this.sleevesRecoveredFromShock = false;
    this.homeRAM = ns.getServerMaxRam("home");
    this.lastRemoteSpinupHackLevel = -1;
    this.isFuckingJoesGuns = false;
}

async function savePhaseState() {
    await ns.write(PHASE1_STATE, JSON.stringify(phaseState), "w");
}

/**
 *  Start selling hashes
 *  Set all sleeves to work out at powerhouse gym
 *  Set main to working out.
 * @returns {Promise<void>}
 */
async function stepOne() {
    log(ns, "Selling hashes.", true);
    ns.run("hacknet.js", 1, "-c");
    for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
        let stat = trainStats[i % 4];
        ns.sleeve.setToGymWorkout(i, gym, stat);
        log(ns, `Sleeve #${i} set to workout ${stat} at ${gym}`, true);
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
async function stepTwo() {
    let notDone = true;
    let currentStat = -1;
    while (notDone) {
        let stat = getStatNumberToWorkout();
        if (stat === -1) {
            notDone = false;
            continue
        }
        if (stat !== currentStat) {
            let ts = trainStats[stat];
            ns.gymWorkout(gym, ts, true);
            log(ns, `Set main to workout ${ts} at ${gym}`, true);
        }
        await ns.sleep(3000);
    }
    ns.bladeburner.joinBladeburnerDivision();
    for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
        let stat = trainStats[i % 4];
        ns.sleeve.setToCommitCrime(i, "homicide");
        log(ns, `Sleeve #${i} set to commit homicide`, true);
    }
    phaseState.currentStep = Phase1Steps.GrowBadKarma;
    await savePhaseState();
}

function getStatNumberToWorkout() {
    let player = ns.getPlayer();
    if (player.strength < MIN_STR)
        return 0;
    if (player.defense < MIN_DEF)
        return 1;
    if (player.dexterity < MIN_DEX)
        return 2;
    if (player.agility < MIN_AGI)
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
    let committingCrimes = false;
    while (notDone) {
        await ns.sleep(timeout); // Wait it out first
        if (ns.isBusy() && committingCrimes) continue;
        let karma = commitCrime(theCrime);
        committingCrimes = true;
        if (karma < GANG_THRESHOLD) {
            notDone = false;
        }
    }

    let invites = ns.singularity.checkFactionInvitations();
    for(let invite of invites){
        ns.singularity.joinFaction(invite);
        log(ns,`SUCCESS: joined the '${invite}' faction.`);
    }
    await ns.sleep(timeout);
    // create gang and start managing
    createGang();
    ns.run("bn12-gang-management.js");
    // start bladeburner script
    ns.run("bn12-bladeburner-management.js", 1);
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

function createGang() {
    if (ns.gang.createGang(GANG_FACTION_NAME)) {
        ns.toast("Gang created!", "success")
        log(ns, "SUCCESS: Combat gang created!")
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
async function stepFour() {
    // Set all sleeves to recover from shock
    for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
        ns.sleeve.setToShockRecovery(i);
        log(ns, `Sleeve #${i} set to shock recovery`, true);
    }
    //let bbAugs = ["The Blade's Simulacrum", "EsperTech Bladeburner Eyewear", "EMS-4 Recombination"];

    let loopCount = 0;
    while (!gotAllMyShit()) {
        loopCount++;
        await checkSleeveShockLevels();
        await spinUpRemoteHacks();
        if (!phaseState.isFuckingJoesGuns) {
            await fuckJoesGuns();
        }
        let money = ns.getServerMoneyAvailable("home");
        if (!phaseState.torPurchased) {
            if (money >= 500_000_000) {
                doDarkWebBusiness(ns);
                phaseState.torPurchased = true;
                phaseState.darkwebProgramsPurchased = true
                await savePhaseState();
                log(ns, "SUCCESS: purchase darkweb programs!", true);
                money = ns.getServerMoneyAvailable("home");
            }
        } else if (phaseState.homeRAM < 1024) {
            if (money >= ns.getUpgradeHomeRamCost()) {
                ns.upgradeHomeRam();
                phaseState.homeRAM = ns.getServerMaxRam("home");
                await savePhaseState();
                log(ns, `SUCCESS: Memory upgraded to ${phaseState.homeRAM}!`, true);
                if (phaseState.homeRAM >= 1024) {
                    ns.run("bn12-stock-management.js", 1);
                    log(ns, `SUCCESS: Running stock manager`, true);
                }
            }
        } else {
            // now we need to purchase augmentations
            if (phaseState.requiredAugmentations.length > 0) {
                if(ns.bladeburner.joinBladeburnerFaction()){
                    let result = await tryBuyAugmentation(phaseState.requiredAugmentations[0]);
                    if (result) {
                        phaseState.purchasedAugmentations.push(phaseState.requiredAugmentations.shift());
                        await savePhaseState();
                    }
                }
            }
        }
        printPhaseProgress();
        await ns.sleep(1000);
        if (loopCount % 60 == 0 && phaseState.homeRAM >= 1024) {
            // try to solve contracts once a minute once we have enough memory
            ns.run("contract-auto-solver.js");
        }

    }
    phaseState.currentStep = Phase1Steps.InstallAugmentations;
    await savePhaseState();
}

function gotAllMyShit() {
    let player = ns.getPlayer();
    let stonksUp = player.has4SData && player.has4SDataTixApi;
    return phaseState.torPurchased &&
        phaseState.darkwebProgramsPurchased &&
        phaseState.homeRAM > 512 &&
        stonksUp &&
        phaseState.purchasedAugmentations.includes("The Blade's Simulacrum") &&
        phaseState.purchasedAugmentations.includes("EsperTech Bladeburner Eyewear") &&
        phaseState.purchasedAugmentations.includes("EMS-4 Recombination") &&
        phaseState.sleevesRecoveredFromShock;
}

async function installAndStartPhase2() {
    ns.run("bn12-stock-management.js", 1, "-l"); // cashout stocks
    await ns.sleep(1000);
    let factionAugs = ns.getAugmentationsFromFaction(GANG_FACTION_NAME);
    for(let aug of factionAugs){
        ns.purchaseAugmentation(GANG_FACTION_NAME, aug);
    }
    log(ns, "SUCCESS: Phase 1 complete! Installing augmentations and starting phase 2.");
    ns.installAugmentations("bn12-phase-2.js");
}

async function spinUpRemoteHacks() {
    let player = ns.getPlayer();
    if (phaseState.lastRemoteSpinupHackLevel === -1 || player.hacking - phaseState.lastRemoteSpinupHackLevel >= 50) {
        log(ns, "Doing some remote spinup!")
        ns.run(REMOTE_HACKING_SCRIPT, 1);
        phaseState.lastRemoteSpinupHackLevel = player.hacking;
        await savePhaseState();
    }
}

async function fuckJoesGuns() {
    let money = ns.getServerMoneyAvailable("home");
    if (money > 100_000_000) {
        ns.run("fuck-joesguns.js");
        phaseState.isFuckingJoesGuns = true;
        await savePhaseState();
        log(ns, "SUCCESS: Joes Guns is fucked!");
    }
}

async function checkSleeveShockLevels() {
    for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
        if (ns.sleeve.getSleeveStats(i).shock > 0) {
            return;
        }
    }
    phaseState.sleevesRecoveredFromShock = true;
    await savePhaseState();
}

async function tryBuyAugmentation(name) {
    return ns.purchaseAugmentation(BB_FACTION_NAME, name);
}

function printPhaseProgress(){
    ns.clearLog();
    ns.tail();
    log(ns, "Phase 1 progress");
    log(ns, "================");
    log(ns, `Current Step: ${phaseState.currentStep}`);
    log(ns, `Darkweb Programs Purchased: ${phaseState.darkwebProgramsPurchased}`);
    log(ns, `Home RAM: ${phaseState.homeRAM}`);
    log(ns, `Joes Guns Fucked: ${phaseState.isFuckingJoesGuns}`);
    log(ns, `Last remote hack leve: ${phaseState.lastRemoteSpinupHackLevel}`);
    log(ns, `Sleeved Recovered: ${phaseState.sleevesRecoveredFromShock}`);
    log(ns, "Augmentations:");
    for(let aug of phaseState.purchasedAugmentations){
        log(ns, `\t${aug}`);
    }
}
