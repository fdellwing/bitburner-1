/** @type import(".").NS */
let ns = null;

/** @param {NS} _ns **/
export async function main(_ns) {
    ns = _ns;    
    if (ns.args.length < 1) {
        ns.tprint("hostname to find required as an argument!");
        return;
    }
    
    var target = ns.args[0];
    ns.tprintf("%d", getHackThreads(target));
}

function getHackThreads(target){
    var hackLevel = ns.getHackingLevel();
    var serverHackLevel = ns.getServerRequiredHackingLevel(target);
    ns.tprintf("hacklevel = %d; Required: %d", hackLevel, serverHackLevel);
    if(hackLevel<serverHackLevel){
        
        return -1;
    }
    var maxServerMoney = ns.getServerMaxMoney(target)
    var serverMoney = ns.getServerMoneyAvailable(target);
    ns.tprintf("max money = %d; current money = %d",maxServerMoney, serverMoney);
    return ns.hackAnalyzeThreads(target, serverMoney);
}