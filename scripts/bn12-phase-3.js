/*
    In this phase we focus on:
        1) purchasing all the bladeburner augmentations for main
        2) upgrading our sleeves with the easily attainable augmentations (NO QLINK or HydroflameLeft Arm)
        3) getting 100% gang territory.
        Once all three are true we install augmentation and start phase 3.
*/
import { getBitnodeState, saveBitnodeState, runScript, doDarkWebBusiness } from "./bn12-lib";
import { log } from "./helpers";

/** @type import(".").NS */
let ns = null;

/** @param {NS} _ns **/
export async function main(_ns) {
    ns = _ns;    
    tlog("WARNING: THIS PHASE IS NOT IMPLENTED!!!!");
    
}

function llog(m){
    log(ns,m);
}

function tlog(m){
    log(ns, m, true);
}   