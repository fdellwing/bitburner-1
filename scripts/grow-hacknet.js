/** @type import(".").NS */
let ns = null;

/** @param {NS} _ns **/
export async function main(_ns) {
    ns = _ns;
    var args = ns.args;

    var nodeCount = 8;
    if (args.length > 0) {
        nodeCount = parseInt(args[0], 10);
    }

    var levels = 200;
    if (args.length > 1) {
        levels = parseInt(args[1], 10);
        if (levels > 200)
            levels = 200;
    }

    var ram = 64;
    if (args.length > 2) {
        ram = parseInt(args[2], 10);
    }

    var cores = 16;
    if (args.length > 3) {
        cores = parseInt(args[3], 10);
    }

    await GrowHacknet(nodeCount, levels, ram, cores);
    ns.toast("GrowHacknet complete!")
}

async function GrowHacknet(nodeCount, levels, ram, cores) {
    var cnt = nodeCount;
    ns.print("Growing hacknet to " + nodeCount + " nodes; levels =  " + levels + "; ram = " + ram + "; cores = " + cores);
    var res = 0;
    var complete = false;

    while (!complete) {
        var action = null;
        complete = true;
        var availableFunds = ns.getServerMoneyAvailable("home");;
        var numNodes = ns.hacknet.numNodes();

        if (numNodes < nodeCount) {
            complete = false;
            let cost = ns.hacknet.getPurchaseNodeCost();
            if (cost <= availableFunds && (action == null || cost < action.cost)) {
                action = new Action(numNodes, "PURCHASE", cost);
            }
        }

        for (let i = 0; i < numNodes; i++) {
            var node = ns.hacknet.getNodeStats(i);
            if (node.level < levels) {
                complete = false;
                let cost = ns.hacknet.getLevelUpgradeCost(i, 1);
                if (cost <= availableFunds && (action == null || cost < action.cost)) {
                    action = new Action(i, "LEVEL", cost);
                }
            }
            if (node.ram < ram) {
                complete = false;
                let cost = ns.hacknet.getRamUpgradeCost(i, 1);
                if (cost <= availableFunds && (action == null || cost < action.cost)) {
                    action = new Action(i, "RAM", cost);
                }
            }
            if (node.cores < cores) {
                complete = false;
                let cost = ns.hacknet.getCoreUpgradeCost(i, 1);
                if (cost <= availableFunds && (action == null || cost < action.cost)) {
                    action = new Action(i, "CORE", cost);
                }
            }
        }

        if (action) {
            if (action.type == "PURCHASE") {
                let n = ns.hacknet.purchaseNode();
                ns.printf("Purchased node %d", n);
            } else if (action.type == "LEVEL") {
                if (ns.hacknet.upgradeLevel(action.index, 1)) {
                    ns.printf("Upgraded node %d level", action.index);
                } else {
                    ns.printf("Upgrade to node %d level failed!", action.index);
                }
            } else if (action.type == "RAM") {
                if (ns.hacknet.upgradeRam(action.index, 1)) {
                    ns.printf("Upgraded node %d ram", action.index);
                } else {
                    ns.printf("Upgrade to node %d ram failed!", action.index);
                }
            } else if (action.type == "CORE") {
                if (ns.hacknet.upgradeCore(action.index, 1)) {
                    ns.printf("Upgraded node %d core", action.index);
                } else {
                    ns.printf("Upgrade to node %d core failed!", action.index);
                }
            } 
        } else {
            if (!complete) {
                await ns.sleep(3000);
            }
        }
    }
    ns.print("Grow Hacknet complete!!")
}

function Action(index, type, cost) {
    this.index = index;
    this.type = type;
    this.cost = cost;
}