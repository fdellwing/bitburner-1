import { getPurchasedServers } from "get-servers.js";
/** @type import(".").NS */
let ns = null;

/** @param {NS} _ns **/
export async function main(_ns) {
    ns = _ns;
    const data = ns.flags([
        ["wait", false],   // wait for money if short on funds
        ["delete", false], // delete old servers
        ["info", false],
        ["ram", ns.getPurchasedServerMaxRam()]
    ]);
    if(data.info){
        printInfo();
        ns.exit();
        return;
    }
    let currentServers = getPurchasedServers(ns);
    let currentServerCount = currentServers.length;
    if (data["delete"]) {
        for (let server of currentServers) {
            ns.tprintf("Deleting %s", server);
            ns.killall(server);
            ns.deleteServer(server);
        }
        currentServerCount = 0;
    }

    let serverLimit = ns.getPurchasedServerLimit();
    let built = 0;
    
    let serverCost = ns.getPurchasedServerCost(data.ram);
    for (let i = currentServerCount; i < serverLimit; ++i) {
        if (data["wait"]) {
            while (ns.getServerMoneyAvailable("home") < serverCost) {
                ns.printf("Need $%d! Sleeping 60 seconds.",serverCost);
                ns.tprintf("Need $%d! Sleeping 60 seconds.",serverCost);
                await ns.sleep(60000);
            }
        }
        if (serverCost <= ns.getServerMoneyAvailable("home")) {
            let serverName = "pserv-" + i;            
            ns.purchaseServer(serverName, data.ram);
            ns.tprintf("Purchased %s", serverName);
            built++;
        }
    }
    ns.tprintf("Built %d servers at %d ram", built, data.ram);
    ns.toast("Server upgrades complete!")
}

function printInfo(){
    let maxRam = ns.getPurchasedServerMaxRam();
    let p = 4;
    while(2**p <= maxRam){
        ns.tprintf("%d => $%d", 2**p, ns.getPurchasedServerCost(2**p));
        p++;
    }
}