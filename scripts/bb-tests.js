/** @type import(".").NS */
let ns = null;

/** @param {NS} _ns **/
export async function main(_ns) {
    ns = _ns;
    ns.scriptKill("bn12-bladeburner-management.js", "home");

    ns.bladeburner.stopBladeburnerAction();
    ns.bladeburner.startAction("BlackOps","Operation Daedalus");
    let running = true;
    let tick = 0;
    while(running){
        tick++;
        await ns.sleep(1000);
        let action = ns.bladeburner.getCurrentAction();
        ns.printf("tick %d: action = %s",tick, action.type);
        if(action.type==="idle"){
            running = false;
        }
    }
    ns.singularity.destroyW0r1dD43m0n(12,"bn12-init.js");
}