import {BitnodeState, saveBitnodeState} from "./bn12-lib";
import {log} from "./helpers";

/** @type import(".").NS */
let ns = null;

/** @param {NS} _ns **/
export async function main(_ns) {
    ns = _ns;
    let bs = new BitnodeState(ns);
    if(bs.bitnode !== 12){
        log(ns, "ERROR: this script is intended for bitnode 12 only!");
        return;
    }
    // clear cache
    for (let file of ns.ls('home', '/Temp/'))
        ns.rm(file);
    await saveBitnodeState(ns, bs);
    ns.spawn("bn12-phase-1.js");
}
