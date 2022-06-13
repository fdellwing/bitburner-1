/*
    In this phase we focus on:
        1) Set sleeves to assist main in doing bladeburner stuff
        2) Grafting on combat augmentations

        Once all three are true we install augmentation and start phase 3.
*/
import {getBitnodeState, saveBitnodeState, runScript, doDarkWebBusiness, executeSleeveOrder, isBitNodeReadyToDie} from "./bn12-lib";
import { log } from "./helpers";

/** @type import(".").NS */
let ns = null;

const PHASE3_STATE = "/Temp/bn12-phase3.txt"

const REMOTE_HACKING_SCRIPT = "infinity-remote-spinup.js";

const startingSleeveScript = [
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

const bladeburnerSleeveScript = [
    //{sleeveNumber: 0, type: "bladeburner", args: ["Take on contracts","Tracking"]},
    {sleeveNumber: 1, type: "bladeburner", args: ["Diplomacy"]},
    {sleeveNumber: 2, type: "bladeburner", args: ["Infiltrate synthoids"]},
    {sleeveNumber: 3, type: "bladeburner", args: ["Diplomacy"]},
    {sleeveNumber: 4, type: "bladeburner", args: ["Diplomacy"]},
    {sleeveNumber: 5, type: "bladeburner", args: ["Diplomacy"]},
    {sleeveNumber: 6, type: "bladeburner", args: ["Infiltrate synthoids"]},
    {sleeveNumber: 7, type: "bladeburner", args: ["Infiltrate synthoids"]},
];

let contracts = ["Retirement", "Bounty Hunter", "Tracking"];

/** @type {PhaseState} */
let phaseState;
const managementScripts = ["bn12-bladeburner-management.js", "bn12-gang-management.js", "bn12-stock-management.js"]

/** @param {NS} _ns **/
export async function main(_ns) {
    ns = _ns;
    tlog("INFO: BN12 PHASE III");
    tlog("Getting state...");
    let bitNodeStateText = await getBitnodeState(ns);
    tlog(bitNodeStateText);
    let bitNodeState = JSON.parse(`${bitNodeStateText}`.trimEnd());

    if(bitNodeState.phase < 2){
        tlog("ERROR: Phase 2 has not been completed!");
        return;
    }

    if (bitNodeState.phase === 2) {
        bitNodeState.phase = 3;
        await saveBitnodeState(ns, bitNodeState);
        phaseState = new PhaseState();
        await savePhaseState();
    } else {
        if(!ns.fileExists(PHASE3_STATE)){
            phaseState = new PhaseState();
            await savePhaseState();
        } else {
            let ps = await ns.read(PHASE3_STATE);
            phaseState = JSON.parse(ps);
        }
    }
    launchManagementScripts();
    setSleevesToWork(startingSleeveScript);
    await doOurThing();
    burnThisMotherFuckerDown();
}

function llog(m){
    log(ns,m);
}

function tlog(m){
    log(ns, m, true);
}

function PhaseState() {
    // The augmentations we are going to purchase
    this.graftQueue = [
        "nickofolas Congruity Implant",
        "nextSENS Gene Modification",
        "Neurotrainer I",
        "LuminCloaking-V1 Skin Implant",
        "LuminCloaking-V2 Skin Implant",
        "INFRARET Enhancement",
        "Neurotrainer II",
        "DermaForce Particle Barrier",
        "SmartSonar Implant",
        "BrachiBlades",
        "Neurotrainer III",
        "Power Recirculation Core",
        "Bionic Arms",
        "Graphene Bionic Arms Upgrade",

    ];
    this.fuckedJoesGuns = false;
    this.lastRemoteSpinupHackLevel = -1;
    this.darkwebProgramsPurchased = false;
    this.readyToDestroyBitnode = false;
}

function launchManagementScripts(){
    for(let s of managementScripts){
        llog(`attempting to launch ${s}`);
        runScript(ns, s);
    }
}

function setSleevesToWork(script){
    for(let order of script){
        executeSleeveOrder(ns, order);
    }
}

async function savePhaseState() {
    await ns.write(PHASE3_STATE, JSON.stringify(phaseState), "w");
}

async function checkOnHacking(){
    if(!phaseState.darkwebProgramsPurchased && myMoney() > 500_000_000){
        doDarkWebBusiness(ns);
        phaseState.darkwebProgramsPurchased = true;
        ns.run("fuck-joesguns.js");
        phaseState.fuckedJoesGuns = true;
        await savePhaseState();
    }

    let player = ns.getPlayer();
    if (phaseState.lastRemoteSpinupHackLevel === -1 || player.hacking - phaseState.lastRemoteSpinupHackLevel >= 50) {
        ns.run("kill-all.js", 1, "-r");
        await ns.sleep(250);
        llog("Doing some remote spin-up!")
        ns.run(REMOTE_HACKING_SCRIPT, 1, "-p");
        phaseState.lastRemoteSpinupHackLevel = player.hacking;
        await savePhaseState();
    }
}

async function doOurThing(){

    let loopCount = 0;
    let sleevesWorking = false;
    let contractCounter = -1;
    while(!phaseState.readyToDestroyBitnode) {
        loopCount++;
        await checkOnHacking();
        if(!ns.singularity.isBusy()){
            await checkGrafting();
        }

        // every 10 minutes we set the sleeves to bb missions
        if(loopCount % 600 === 0){
            contractCounter++;
            if(!sleevesWorking) {
                setSleevesToWork(bladeburnerSleeveScript);
                sleevesWorking = true;
            }
            let contract = contracts[contractCounter % 3];
            ns.sleeve.setToBladeburnerAction(0,"Take on contracts", contract);
        }

        await ns.sleep(1000);
        if (loopCount % 300 === 0) {
            // try to solve contracts once a minute once we have enough memory
            ns.run("contract-auto-solver.js");
        }
        phaseState.readyToDestroyBitnode = isBitNodeReadyToDie(ns);
    }
}

function myMoney(){
    return ns.getServerMoneyAvailable("home");
}

async function checkGrafting(){
    if(ns.getPlayer().location !== "New Tokyo"){
        ns.singularity.travelToCity("New Tokyo");
    }
    let augs = ns.grafting.getGraftableAugmentations();
    if(augs.length===0) {
        return;
    }
    let graftMe = augs[0];
    if(phaseState.graftQueue.length > 0){
        if(augs.includes(phaseState.graftQueue[0])){
            graftMe = phaseState.graftQueue[0];
        } else {
            phaseState.graftQueue.shift();
            await savePhaseState();
            return;
        }
    }
    if(myMoney() >= ns.grafting.getAugmentationGraftPrice(graftMe)){
        ns.grafting.graftAugmentation(graftMe,true);
    }
}

function burnThisMotherFuckerDown(){
    
    // You must have the special augment installed and the required hacking level OR Completed the final black op.
    ns.singularity.destroyW0r1dD43m0n(12,"bn12-init.js");
}