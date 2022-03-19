import { getPurchasedServers} from "get-servers.js";

/** @type import(".").NS */
let ns = null;

/** @param {NS} _ns **/
export async function main(_ns) {
    ns = _ns;    
    var servers = getPurchasedServers(ns);
    let i = 0;
    for(let server of servers){
        i++;
        ns.tprintf("%d. %s", i, server);
    }
}