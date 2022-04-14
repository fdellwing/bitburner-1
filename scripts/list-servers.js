import { getAllServers } from "helpers.js";

/** @type import(".").NS */
let ns = null;
const argsSchema = [
    ["p", false], // include personal
    ["personal", false], // include personal    
];
/** @param {NS} _ns **/
export async function main(_ns) {
    ns = _ns;
    let options = ns.flags(argsSchema);
    let ip = options.p || options.personal;
    var servers = getAllServers(ns, "home", ip);
    let i = 0;
    for (let server of servers) {
        if (server === "home" && !ip) {            
            continue;
        }
        i++;
        ns.tprintf("%d. %s", i, server);
    }
}