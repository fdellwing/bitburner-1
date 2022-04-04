/*
BN3 is a shit bitnode that can't be started up like the rest. For this one we simply
need something to start rolling up the hack number. There is barely a reason to 
hack because we get very little from it, but to finish the bitnode you have to install
the backdoor, and to do that you need a big hack number in this bitnode. 
*/
/** @type import(".").NS */
let ns = null;

/** @param {NS} _ns **/
export async function main(_ns) {
    ns = _ns;    
    await IntitialAttack();
        
}


async function IntitialAttack() {
    ns.print("Commencing initial attack on N00dles");
    var target = "n00dles"; // patsy for a target

    ns.print("target: " + target);
    var scriptName = "early-hack.js";
    // Array of all servers that don't need any ports opened
    // to gain root access. These have 16 GB of RAM
    var servers0Port = ["sigma-cosmetics",
        "joesguns",
        "nectar-net",
        "hong-fang-tea",
        "harakiri-sushi"];

    // Array of all servers that only need 1 port opened
    // to gain root access. These have 32 GB of RAM
    var servers1Port = ["neo-net",
        "zer0",
        "max-hardware",
        "iron-gym"];

    // Copy our scripts onto each server that requires 0 ports
    // to gain root access. Then use nuke() to gain admin access and
    // run the scripts.
    for (var i = 0; i < servers0Port.length; ++i) {
        var serv = servers0Port[i];

        await ns.scp(scriptName, serv);
        ns.nuke(serv);
        ns.exec(scriptName, serv, 6, target);
        ns.print("executing " + scriptName + " on " + target)
    }

    // Wait until we acquire the "BruteSSH.exe" program
    while (!ns.fileExists("BruteSSH.exe")) {
        await ns.sleep(60000);
    }

    // Copy our scripts onto each server that requires 1 port
    // to gain root access. Then use brutessh() and nuke()
    // to gain admin access and run the scripts.
    for (var i = 0; i < servers1Port.length; ++i) {
        var serv = servers1Port[i];

        await ns.scp(scriptName, serv);
        ns.brutessh(serv);
        ns.nuke(serv);
        ns.exec(scriptName, serv, 12, target);
        ns.print("executing " + scriptName + " on " + target)
    }
}