import { getPurchasedServers } from "get-servers.js";
/** @type import(".").NS */
let ns = null;

/** @param {NS} _ns **/
export async function main(_ns) {
    ns = _ns;
    const data = ns.flags([
        ["wait", false],   // wait for money if short on funds
        ["delete", false], // delete old servers
    ]);
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
    let maxRam = ns.getPurchasedServerMaxRam();
    let serverCost = ns.getPurchasedServerCost(maxRam);
    for (let i = currentServerCount; i < serverLimit; ++i) {                
        if(data["wait"]){
            while(ns.getServerMoneyAvailable("home") < serverCost){
                ns.tprintf("Need more money! Sleeping 60 seconds.")
                await ns.sleep(60000)
            }
        }
        if (serverCost <= ns.getServerMoneyAvailable("home")) {
            let serverName = "pserv-" + i
            ns.purchaseServer(serverName, maxRam);
            built++;
        }
    }
    ns.tprintf("Built %d servers at %d ram", built, maxRam);
    ns.toast("Server upgrades complete!")
}