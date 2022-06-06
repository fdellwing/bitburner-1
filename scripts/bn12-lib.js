
const BITNODE_STATE_FILE = "Temp/bn12-state.txt";

/** @param {NS} ns **/
export function BitnodeState(ns){
    let player = ns.getPlayer();
    this.bitnode = player.bitNodeN;
    this.phase = 0;
}

/**
 * Write our current state of the bitnode progress.
 * @param {NS} ns
 * @param {BitnodeState} bitnodeState
 **/
export async function saveBitnodeState(ns, bitnodeState){
    let text = JSON.stringify(bitnodeState);
    await ns.write(BITNODE_STATE_FILE, text, "w");
}

/**
 * Get the current saved state of the bitnode progress
 * @param {NS} ns
 * @returns {Promise<BitnodeState>}
 */
export async function getBitnodeState(ns) {
    let text = await ns.read(BITNODE_STATE_FILE);
    return JSON.parse(text);
}

/**
 *
 * @param {NS} ns
 */
export function doDarkWebBusiness(ns){
    ns.purchaseTor();
    let programs = ns.getDarkwebPrograms();
    for(let p of programs){
        ns.purchaseProgram(p);
    }
}