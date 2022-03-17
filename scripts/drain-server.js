// This script was written to complete the "Big trouble" achievement
// It should not be used for any other purpose.
/** @type import(".").NS */
let ns = null;
let hackFails = 0;
/** @param {NS} _ns **/
export async function main(_ns) {
    ns = _ns;
    if (ns.args.length < 1) {
        ns.tprint("hostname to find required as an argument!");
        return;
    }

    var target = ns.args[0];
    var serverMoney = ns.getServerMoneyAvailable(target)
    let sfrom = ns.getServerSecurityLevel(target);
    let sto = ns.getServerMinSecurityLevel(target);
 
    if (ns.hackAnalyzeChance(target) < 0.90 && sto < sfrom) {
        ns.printf("Hard server, will weaken first");
        await weakenTarget(target);
    }
    while (serverMoney > 0) {

        if (hackFails >= 5) {
            weakenTarget();
        }

        let earnedMoney = await ns.hack(target);
        if (earnedMoney == 0) {
            hackFails++;
        }
        serverMoney = ns.getServerMoneyAvailable(target)
    }
    ns.tprintf("%s is drained!", target);
}

async function weakenTarget(target) {
    let from = ns.getServerSecurityLevel(target);
    let to = ns.getServerMinSecurityLevel(target);
    ns.printf("weakening %s from %f to %f", target, from, to);
    while (from > to + 1) {
        await ns.weaken(target);
        from = ns.getServerSecurityLevel(target);
        to = ns.getServerMinSecurityLevel(target);
    }
    hackFails = 0;
}
