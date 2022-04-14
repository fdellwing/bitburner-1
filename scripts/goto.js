/** @type import(".").NS */
let ns = null;

/** @param {NS} _ns **/
export async function main(_ns) {
    ns = _ns;    
    const args = ns.flags([["help", false]]);
    let route = [];
    let server = args._[0];
    if (!server || args.help) {
        ns.tprint("This script helps you connect to a sever multiple jumps away");
        ns.tprint(`Usage: run ${ns.getScriptName()} SERVER`);
        ns.tprint("Example:");
        ns.tprint(`> run ${ns.getScriptName()} The-Cave`);
        return;
    }

    recursiveScan('', 'home', server, route);
    let jump = 0;
    for (const i in route) {
        jump++;
        await ns.sleep(500);
        const extra = i > 0 ? "└ " : "";
        ns.tprint(`${" ".repeat(i)}${extra}[${jump}] ${route[i]}`);
        ns.connect(route[i]);    
    }
}

function recursiveScan(parent, server, target, route) {
    const children = ns.scan(server);
    for (let child of children) {
        if (parent == child) {
            continue;
        }
        if (child.toLowerCase() == target.toLowerCase()) {
            route.unshift(child);
            route.unshift(server);
            return true;
        }

        if (recursiveScan(server, child, target, route)) {
            route.unshift(server);
            return true;
        }
    }
    return false;
}