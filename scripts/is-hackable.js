/** @type import(".").NS */
let ns = null;

/** @param {NS} _ns **/
export async function main(_ns) {
    ns = _ns;    
    if(ns.getServerRequiredHackingLevel("netlink") <= ns.getHackingLevel()){
        ns.tprint("hackable");

    } else {
        ns.tprint("not hackable")
    }
}