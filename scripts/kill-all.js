import { getAllServers } from "./helpers.js"
const argsSchema = [    
    ["r", false],
    ["remote-only", false],    
]
/** @param {import(".").NS} ns **/
export async function main(ns) {
    var startingNode = ns.getHostname();
    var options = ns.flags(argsSchema);
    const serverList = getAllServers(ns, startingNode, true);
    var remoteOnly = (options.r || options["remote-only"]);


    for (const server of serverList) {        
        if (server == startingNode)
            continue;
        
        if (ns.ps(server) === 0)
            continue;

        ns.killall(server);
    }

    for (const server of serverList) {
        if (server == startingNode)
            continue;
        
        while (ns.ps(server) > 0) {
            await ns.sleep(20);
        }
        
        for (let file of ns.ls(server, '.js'))
            ns.rm(file, server)
    }

    if(!remoteOnly){
        ns.killall(startingNode);
    }
}