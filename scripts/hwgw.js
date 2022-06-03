/*
    Script: hwgw.js
    Author: KodeMonkey
    Description:
        This is my first go at batching.
 */

/** @type import(".").NS */
let ns = null;
let argsSchema=[
    ["help", false]
]

////////////////////
// Helper scripts //
////////////////////////////////////////////////////////////////////////////////////////////////////


/** @param {NS} _ns **/
export async function main(_ns) {
    ns = _ns;
    let opts = ns.flags(argsSchema);

}