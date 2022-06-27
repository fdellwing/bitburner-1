/*
    In this phase we focus on:
        1) purchasing all the bladeburner augmentations for main
        2) upgrading our sleeves with the easily attainable augmentations (NO QLINK or HydroflameLeft Arm)
        3) getting 100% gang territory.
        Once all three are true we install augmentation and start phase 3.
*/
import { getBitnodeState, saveBitnodeState, runScript, doDarkWebBusiness, executeSleeveOrder, pimpOutHomeSystem } from "./bn12-lib";
import { log, formatMoney } from "./helpers";
/** @type import(".").NS */
let ns = null;
const PHASE2_STATE = "/Temp/bn12-phase2.txt"
const SLEEVE_AUG_NUMBER = 55;
const REMOTE_HACKING_SCRIPT = "infinity-remote-spinup.js";
const avoidedSleeveAugmentations = ["QLink", "Hydroflame Left Arm"];
const GANG_FACTION_NAME = "Slum Snakes";
const BB_FACTION_NAME = "Bladeburners";

const sleeveScript = [
    {sleeveNumber: 0, type: "gym", args: ["Powerhouse Gym","strength"]},
    {sleeveNumber: 1, type: "gym", args: ["Powerhouse Gym","defense"]},
    {sleeveNumber: 2, type: "gym", args: ["Powerhouse Gym","dexterity"]},
    {sleeveNumber: 3, type: "gym", args: ["Powerhouse Gym","agility"]},
    {sleeveNumber: 4, type: "crime", args: ["homicide"]},
    {sleeveNumber: 5, type: "crime", args: ["homicide"]},
    {sleeveNumber: 6, type: "travel", args: ["Volhaven"]},
    {sleeveNumber: 7, type: "travel", args: ["Volhaven"]},
    {sleeveNumber: 6, type: "university", args: ["ZB Institute of Technology", "Algorithms"]},
    {sleeveNumber: 7, type: "university", args: ["ZB Institute of Technology", "Leadership"]},
];

// These are the names I gave my sleeves, only for IO purposes
const sleeveNames = [
    "Adam",
    "Blade",
    "Connor",
    "Deckard",
    "Elliot",
    "Flynn",
    "Gibson",
    "Hendrix"
];
/** @type {PhaseState} **/
let phaseState;
const managementScripts = ["bn12-bladeburner-management.js", "bn12-gang-management.js", "bn12-stock-management.js"]

/** @param {NS} _ns **/
export async function main(_ns) {
    ns = _ns;  
    ns.disableLog("ALL");  
    tlog("INFO: BN12 PHASE II");
    tlog("Getting state...");
    let bitnodeStateText = await getBitnodeState(ns);
    tlog(bitnodeStateText);
    let bitnodeState = JSON.parse(`${bitnodeStateText}`.trimEnd());

    if (bitnodeState.phase === 1) {
        bitnodeState.phase = 2;
        await saveBitnodeState(ns, bitnodeState);
        phaseState = new PhaseState();
        await savePhaseState();
    } else {
        if(!ns.fileExists(PHASE2_STATE)){
            phaseState = new PhaseState();
            await savePhaseState();    
        } else {
            let ps = await ns.read(PHASE2_STATE);
            phaseState = JSON.parse(ps);
        }
    }
    launchManagementScripts();
    setSleevesToWork();
    await doOurThing();
    await installAndStartPhase3();
}

function llog(m){
    log(ns,m);
}

function tlog(m){
    log(ns, m, true);
}

function PhaseState() {
    this.purchasedAugmentations = [];
    this.allSleevesUpgraded = false;
    this.allBladeburnerAugsPurchased = false;
    this.ownAllGangTerritory = false;

    // The augmentations we are going to purchase
    this.requiredAugmentations = ["Vangelis Virus",
            "Hyperion Plasma Cannon V1",
            "BLADE-51b Tesla Armor",
            "BLADE-51b Tesla Armor: Unibeam Upgrade",
            "BLADE-51b Tesla Armor: Omnibeam Upgrade",
            "Vangelis Virus 3.0",
            "GOLEM Serum",
            "Blade's Runners",
            "BLADE-51b Tesla Armor: Energy Shielding Upgrade",
            "I.N.T.E.R.L.I.N.K.E.D",
            "Hyperion Plasma Cannon V2",
            "BLADE-51b Tesla Armor: Power Cells Upgrade",
            "BLADE-51b Tesla Armor: IPU Upgrade",
            "ORION-MKIV Shoulder"];  
            
    this.fuckedJoesGuns = false;
    this.lastRemoteSpinupHackLevel = -1;
    this.darkwebProgramsPurchased = false;
}

function launchManagementScripts(){
    for(let s of managementScripts){
        llog(`attempting to launch ${s}`);
        runScript(ns, s);
    }
}

function setSleevesToWork(){
    for(let order of sleeveScript){
        executeSleeveOrder(ns, order);
    }
}

async function savePhaseState() {
    await ns.write(PHASE2_STATE, JSON.stringify(phaseState), "w");
}

async function doOurThing(){
    let loopCount = 0;
    while(!phaseState.allBladeburnerAugsPurchased || !phaseState.allSleevesUpgraded || !phaseState.ownAllGangTerritory) {
        loopCount++;
        await checkOnHacking();
        if(!phaseState.ownAllGangTerritory){
            await checkGanglandTurf();
        }
        if(!phaseState.allBladeburnerAugsPurchased){
            // attempt to purchase an augmentation
            if(phaseState.requiredAugmentations.length===0){
                phaseState.allBladeburnerAugsPurchased = true;
                await savePhaseState();
            } else {
                let result = await tryBuyAugmentation(phaseState.requiredAugmentations[0]);
                if (result) {
                    phaseState.purchasedAugmentations.push(phaseState.requiredAugmentations.shift());
                    await savePhaseState();
                    continue;
                }
            }
        }
        if(!phaseState.allSleevesUpgraded){
            await tryUpgradeSleeves();
        }

        printPhaseProgress();
        await ns.sleep(1000);
        if (loopCount % 300 == 0) {
            // try to solve contracts once a minute once we have enough memory
            ns.run("contract-auto-solver.js");
        }
    }
}

async function checkGanglandTurf(){
    if(ns.gang.getGangInformation().territory===1){
        phaseState.ownAllGangTerritory = true;
        await savePhaseState();
    }
}

async function checkOnHacking(){
    if(!phaseState.darkwebProgramsPurchased && myMoney() > 500_000_000){
        doDarkWebBusiness(ns);
        phaseState.darkwebProgramsPurchased = true;
        await savePhaseState();
    }

    let player = ns.getPlayer();
    if (phaseState.lastRemoteSpinupHackLevel === -1 || player.hacking - phaseState.lastRemoteSpinupHackLevel >= 50) {
        ns.run("kill-all.js", 1, "-r");
        await ns.sleep(250);
        llog("Doing some remote spinup!")
        ns.run(REMOTE_HACKING_SCRIPT, 1, "-p");
        phaseState.lastRemoteSpinupHackLevel = player.hacking;
        await savePhaseState();
    }
}

async function tryUpgradeSleeves(){
    let sleeveNum = ns.sleeve.getNumSleeves();
    let completed = 0;
    for(let i = 0; i < sleeveNum; i++){
        let sleeveAugs = ns.sleeve.getSleeveAugmentations(i);
        if(sleeveAugs.length>=SLEEVE_AUG_NUMBER){
            completed++;
            continue;
        }
        if(myMoney() >= calculateMoneyRequiredForAugmentations(i)){
            purchaseAvailableAugmentations(i);
        } else {
            return;
        }
    }

    // if we get this far then we are done with sleeveAugmentations
    phaseState.allSleevesUpgraded = completed===sleeveNum;
    await savePhaseState();
}

/**
 * Calculate the total augmentation bill for a sleeve with options to print to log and terminal
 * @param {number} sleeveNum - sleeve number
 * @param {boolean} doPrint - set to true to print info to log and terminal
 */
 function calculateMoneyRequiredForAugmentations(sleeveNum, doPrint=false){
    let augmentations = ns.sleeve.getSleevePurchasableAugs(sleeveNum);
    let total = 0;
    if(doPrint){
        log(ns, `${sleeveNames[sleeveNum]}'s available augmentations: `,true);
        log(ns, `==============================================`,true);
    }
    for(let aug of augmentations){
        if(avoidedSleeveAugmentations.includes(aug.name)){
            continue;
        }
        total += aug.cost;
        if(doPrint){
            log(ns, `\t${aug.name}\t\t${formatMoney(aug.cost)}`,true);
        }
    }
    if(augmentations.length===0 && doPrint){
        log(ns,"No augmentations are available for this sleeve.", true);
    }
    if(doPrint){
        log(ns,`==============================================`,true)
        log(ns,`${sleeveNames[sleeveNum]}'s Total: ${formatMoney(total)}`,true)
        log(ns,`==============================================`,true)
    }
    return total;
}

/**
 * Purchase available augmentations for a sleeve, as long as there is enough money
 * @param {number} sleeveNum - sleeve number
 * @param {boolean} doPrint - set to true to print info to log and terminal
 */
function purchaseAvailableAugmentations(sleeveNum, doPrint=false){
    let augmentations = ns.sleeve.getSleevePurchasableAugs(sleeveNum);
    augmentations.sort((a,b)=>{
        if(a.cost < b.cost)
            return -1;
        if(a.cost> b.cost)
            return 1;
        return 0;
    });
    let total = 0;
    for(let aug of augmentations){
        if(avoidedSleeveAugmentations.includes(aug.name)){
            continue;
        }
        let myMoney = ns.getServerMoneyAvailable("home");
        if(myMoney > aug.cost){
            if(ns.sleeve.purchaseSleeveAug(sleeveNum, aug.name)){
                log(ns,`INFO: ${sleeveNames[sleeveNum]} purchased ${aug.name} for ${formatMoney(aug.cost)}`);
                total += aug.cost;
            } else {
                log(ns,`WARN: ${sleeveNames[sleeveNum]} failed to purchase ${aug.name} for ${formatMoney(aug.cost)}`);
            }
        } else {
            break;
        }
    }
    return total;
}

function myMoney(){
    return ns.getServerMoneyAvailable("home");
}

async function tryBuyAugmentation(name) {
    return ns.purchaseAugmentation(BB_FACTION_NAME, name);
}

function printPhaseProgress(){
    ns.clearLog();
    ns.tail();
    log(ns, "Phase 2 progress");
    log(ns, "================");
    log(ns, `Gang Territory 100%: ${phaseState.ownAllGangTerritory}`);
    log(ns, `Sleeves Upgraded: ${phaseState.allSleevesUpgraded}`);
    log(ns, `Augmentations Purchased: ${phaseState.allBladeburnerAugsPurchased}`);
    log(ns, "Augmentations:");
    for(let aug of phaseState.purchasedAugmentations){
        log(ns, `\t${aug}`);
    }
}

async function installAndStartPhase3() {
    ns.run("bn12-stock-management.js", 1, "-l"); // cashout stocks
    await ns.sleep(1000);
    while(ns.bladeburner.getCurrentAction().type == "BlackOps") {
        tlog("Unable to install augmentations while doing Black-Ops!")
        await ns.sleep(10000); // don't interrupt if we are doing some black op shit
    }
    let factionAugs = ns.getAugmentationsFromFaction(GANG_FACTION_NAME);
    for(let aug of factionAugs){
        ns.purchaseAugmentation(GANG_FACTION_NAME, aug);
    }
    // buy memory and core upgrades if possible
    pimpOutHomeSystem(ns);
    log(ns, "SUCCESS: Phase 2 complete! Installing augmentations and starting phase 3.");
    ns.installAugmentations("bn12-phase-3.js");
}
