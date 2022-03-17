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
    var maxServerMoney = ns.getServerMaxMoney(target);
    var growThreshold = maxServerMoney * 0.95;
    let serverSecurity = ns.getServerSecurityLevel(target);
    let serverMinSercurity = ns.getServerMinSecurityLevel(target);

    if (ns.hackAnalyzeChance(target) < 0.90 && serverMinSercurity < serverSecurity) {
        ns.printf("Hard server, will weaken first");
        await weakenTarget(target);
    }

    while (true) {
        if (ns.getServerMoneyAvailable(target) == 0) {
            await growTarget(target, growThreshold);
        }
        await hackTarget(target);
    }
}

async function hackTarget(target) {

    while (ns.getServerMoneyAvailable(target) > 0) {
        if (hackFails >= 5) {
            await weakenTarget();
        }
        let earnedMoney = await ns.hack(target);
        if (earnedMoney == 0) {
            hackFails++;
            ns.printf("Hack failed :(");
        } else {
            ns.printf("Hacked %s for $%d", target, earnedMoney);
        }
    }
}

async function weakenTarget(target) {
    let from = ns.getServerSecurityLevel(target);
    let to = ns.getServerMinSecurityLevel(target);
    while (from > to + 1) {
        ns.printf("weakening %s from %f to %f", target, from, to);
        await ns.weaken(target);
        from = ns.getServerSecurityLevel(target);
        to = ns.getServerMinSecurityLevel(target);
    }
    hackFails = 0;
}

async function growTarget(target, threshold) {
    while (ns.getServerMoneyAvailable(target) < threshold) {

        if (hackFails >= 5) {
            await weakenTarget();
        }

        let growth = await ns.grow(target);
        if (growth == 0) {
            ns.printf("grow failed :(");
            hackFails++;
        } else {
            ns.printf("Grew to %d", ns.getServerMoneyAvailable(target))
        }
    }
}

