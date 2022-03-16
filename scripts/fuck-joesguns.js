/** @type import(".").NS */
let ns = null;


/** @param {NS} _ns **/
export async function main(_ns) {
    ns = _ns;    
    /*
    var servers = ns.getPurchasedServers();
    if(servers.length>0){
        for(var i = 0; i < servers.length; i++){
            ns.killall(servers[i]);
            if(ns.deleteServer(servers[i])){
                ns.print("deleted " + servers[i]);
            } else {
                ns.print("failed to delete " + servers[i]);
            }
            
        }
    }
    */
    await fuckJoesGuns();
}

async function fuckJoesGuns(){
    // How much RAM each purchased server will have. In this case, it'll
    // be 16GB.
    var ram = 16;
    var scriptName = "early-hack.js";

    // Iterator we'll use for our loop
    var i = 0;
    var serverLimit = ns.getPurchasedServerLimit();
    ns.print("Spinning up " + serverLimit + " new servers.");
    // Continuously try to purchase servers until we've reached the maximum
    // amount of servers
    while (i < serverLimit) {
        var serverCost = ns.getPurchasedServerCost(ram);
        var myMoney = ns.getServerMoneyAvailable("home");

        // Check if we have enough money to purchase a server
        if (myMoney > serverCost) {
            // If we have enough money, then:
            //  1. Purchase the server
            //  2. Copy our hacking script onto the newly-purchased server
            //  3. Run our hacking script on the newly-purchased server with 3 threads
            //  4. Increment our iterator to indicate that we've bought a new server
            var hostname = ns.purchaseServer("pserv-" + i, ram);
            await ns.scp(scriptName, hostname);
            ns.exec(scriptName, hostname, 6, "joesguns");
            ++i;
            ns.print("Purchased server #" + i + " for " + serverCost);
        } else {
            ns.print("Need $" + (serverCost - myMoney) + " to buy next server");
            await ns.sleep(60000);
        }
    }    
}