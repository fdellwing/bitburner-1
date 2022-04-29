import { getAllServers } from "helpers.js";
// At first you only have 32GB of memory so this script first starts hacking to get money 
// in order to upgrade home memory. 
/** @type import(".").NS */
let ns = null;
const remote_spinup = "infinity-remote-spinup.js";
const home = "home";
const timeout = 250;

/** @param {NS} _ns **/
export async function main(_ns) {    
    ns = _ns;        
    let hackLevel = ns.getHackingLevel();
    let lastRestartLevel = 0;
    if(!remote_spinup)
        return;

    ns.exec(remote_spinup, home)
    lastRestartLevel = hackLevel;
    while(hackLevel < 100 && ns.getServerMoneyAvailable("home") < 11000000){
        hackLevel = ns.getHackingLevel();
        if(hackLevel % 10 == 0 & lastRestartLevel < hackLevel){
            await killAll();
            ns.exec(remote_spinup, home);
        }
        await ns.sleep(timeout);
    }
    ns.toast("BN5 startup complete");
}

async function killAll(){
    let startingNode = "home";
    const serverList = getAllServers(ns);

    // Send the kill command to all servers
    for (const server of serverList) {
        // skip if this host, we save it for last
        if (server == startingNode)
            continue;

        // skip if not running anything
        if (ns.ps(server) === 0)
            continue;

        // kill all scripts
        ns.killall(server);
    }

    // idle for things to die
    for (const server of serverList) {
        // skip if this host, we save it for last
        if (server == startingNode)
            continue;
        // idle until they're dead, this is to avoid killing the cascade before it's finished.
        while (ns.ps(server) > 0) {
            await ns.sleep(20);
        }
    }
}