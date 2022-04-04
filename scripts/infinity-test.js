/** @type import(".").NS */
let ns = null;

/** @param {NS} _ns **/
export async function main(_ns) {
    ns = _ns;    
    const target = "foodnstuff";

    for(let id = 1; id <= 333; ++id){
        ns.exec("infinity-attack.js","home",1,"--target", target, "--id", id);
        await ns.sleep(1000);
    }   
}