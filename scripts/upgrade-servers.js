import { getPurchasedServers} from "get-servers.js";
/** @type import(".").NS */
let ns = null;

/** @param {NS} _ns **/
export async function main(_ns) {
    ns = _ns;    
    
    var currentServers = getPurchasedServers(ns);
    for(let server of currentServers){
        ns.tprintf("Deleting %s",server);
        ns.killall(server);
        ns.deleteServer(server);
    }
    var serverLimit = ns.getPurchasedServerLimit();
    var built = 0;
    for(let i = 0; i < serverLimit; ++i){
        var maxRam = ns.getPurchasedServerMaxRam();
        var serverCost = ns.getPurchasedServerCost(maxRam);
        if(serverCost <= ns.getServerMoneyAvailable("home")){
            let serverName = "pserv-" + i
            ns.purchaseServer(serverName, maxRam);
            built++;
        }
    }
    ns.tprintf("Built %d servers at %d ram", built, maxRam);
}