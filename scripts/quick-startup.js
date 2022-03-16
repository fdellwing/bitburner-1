/*

This script gets run every time I startup after installing augemntations. The main idea
behind this script is to start earning money and keep growing the amount of income per
second. This is my first attempt at trying to automate all the initial tasks that I 
was doing manually.


REMINDER: Write await before any call to the following Netscript functions:

        hack
        grow
        weaken
        sleep
        prompt
        wget
        scp
        write
        writePort

*/
/** @type import(".").NS */
let ns = null;

let hacknet_complete = false;


/** @param {NS} _ns **/
export async function main(_ns) {
    ns = _ns;

    // buy a hacknet node to start the making a little money
    ns.hacknet.purchaseNode();
    // start attacking N00dles to increase income
    // This will require building BruteSSH to complete, which is still manual.
    await IntitialAttack();
    await GrowHacknet(8, 120, 16, 8);
    // TODO - Add servers and attack joesguns
    ns.print("Exiting Control!")
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

function myMoney() {
    return ns.getServerMoneyAvailable("home");
}

async function GrowHacknet(nodeCount, levels, ram, cores) {
    var cnt = nodeCount;
    ns.print("Growing hacknet to " + nodeCount + " nodes");
    var res = 0;
    while (ns.hacknet.numNodes() < cnt) {
        res = ns.hacknet.purchaseNode();
        ns.print("Purchased hacknet Node with index " + res);
    };

    for (var i = 0; i < cnt; i++) {
        while (ns.hacknet.getNodeStats(i).level < levels) {
            var cost = ns.hacknet.getLevelUpgradeCost(i, 10);
            while (myMoney() < cost) {
                ns.print("Need $" + cost + " . Have $" + myMoney());
                await ns.sleep(3000);
            }
            res = ns.hacknet.upgradeLevel(i, 10);
        };
    };

    ns.print("All nodes upgraded to level" + levels);

    for (var i = 0; i < cnt; i++) {
        while (ns.hacknet.getNodeStats(i).ram < ram) {
            var cost = ns.hacknet.getRamUpgradeCost(i, 2);
            while (myMoney() < cost) {
                ns.print("Need $" + cost + " . Have $" + myMoney());
                await ns.sleep(3000);
            }
            res = ns.hacknet.upgradeRam(i, 2);
        };
    };

    ns.print("All nodes upgraded to " + ram + "GB RAM");

    for (var i = 0; i < cnt; i++) {
        while (ns.hacknet.getNodeStats(i).cores < cores) {
            var cost = ns.hacknet.getCoreUpgradeCost(i, 1);
            while (myMoney() < cost) {
                ns.print("Need $" + cost + " . Have $" + myMoney());
                await ns.sleep(3000);
            }
            res = ns.hacknet.upgradeCore(i, 1);
        };
    };

    ns.print("All nodes upgraded to " + cores + " cores");
    ns.print("Grow Hacknet complete!!")
}

