import { getAllServers } from "get-servers.js";

/** @type import(".").NS */
let ns = null;
const scriptName = "infinity-grow.js";
/** @param {NS} _ns **/
export async function main(_ns) {
    ns = _ns;
    let nodes = getAllServers(ns, "home");
    let servers = getServerObjects(nodes);
    let myHackLevel = ns.getHackingLevel();
    let scriptMemoryRequired = ns.getScriptRam(scriptName);
    var availableRam = ns.getServerMaxRam("home") - ns.getServerUsedRam("home");
    let threadPool = parseInt(availableRam / scriptMemoryRequired);
    let i = 0;
    for (let server of servers) {
        i++;
        if (server.requiredHackingSkill <= myHackLevel && server.moneyMax > 0) {
            threadPool -= attack(server.hostname, threadPool);
        } else {
            ns.tprintf("Skipping %s.", server.hostname);
        }
        if (threadPool == 0) {
            ns.tprint("Threadpool depleted, exiting program.");
            ns.exit();
            return;
        }
    }
}

function getServerObjects(nodes) {
    let servers = [];
    for (let node of nodes) {
        servers.push(ns.getServer(node));
    }
    servers.sort(function (a, b) {
        if (a.moneyMax < b.moneyMax) {
            return 1;
        }
        if (a.moneyMax > b.moneyMax) {
            return -1;
        }
        return 0;
    });
    return servers;
}

// attack a server
function attack(server, remainingThreads) {
    let hackalyze = ns.hackAnalyze(server);
    let hackThreads = 1;
    if (hackalyze > 0){
        hackThreads = parseInt(.10 / ns.hackAnalyze(server)) + 1;
    }
    let growThreads = parseInt(ns.growthAnalyze(server, 4)) + 1;
    let weakenThreads = hackThreads * 2;

    if (hackThreads + growThreads + weakenThreads > remainingThreads) {
        let total = hackThreads + growThreads + weakenThreads;
        hackThreads = parseInt((hackThreads / total) * remainingThreads);
        growThreads = parseInt((growThreads / total) * remainingThreads);
        weakenThreads = remainingThreads - (hackThreads + growThreads);
    }
    let id = Date.now();
    ns.tprintf("Attacking %s with %d hack; %d grow; %d weaken threads.", server, hackThreads, growThreads, weakenThreads);
    ns.exec("infinity-hack.js", "home", hackThreads, "--target", server, "--id", id);
    ns.exec("infinity-grow.js", "home", growThreads, "--target", server, "--id", id);
    ns.exec("infinity-weaken.js", "home", weakenThreads, "--target", server, "--id", id);
    return hackThreads + growThreads + weakenThreads;
}