/*
 * hacknet.js
 * Author: KodeMonkey
 * Description: Some useful functions for managing a hacknet
 *
 * Required Source Files: 9.1
 *
 * TODO: 
 *  - Bounds checking on grow arguments
 *  - Source file requirements validation 
 */

import { log, formatMoney } from "helpers.js";

/** @type import(".").NS */
let ns = null;
const SELL_FOR_MONEY = "Sell for Money";
const EXCHANGE_FOR_BLADEBURNER_RANK = "Exchange for Bladeburner Rank";
const EXCHANGE_FOR_BLADEBURNER_SP = "Exchange for Bladeburner SP";
const SELL_FOR_CORPORATION_FUNDS = "Sell for Corporation Funds";
const EXCHANGE_FOR_CORPORATION_RESEARCH = "Exchange for Corporation Research";
const IMPROVE_GYM_TRAINING = "Improve Gym Training";
const IMPROVE_STUDYING = "Improve Studying";
const GENERATE_CODING_CONTRACT = "Generate Coding Contract";

const argsSchema = [
    ["bb", false],          // do bladeburner upgrades
    ["cache", 4],           // cache-level for grow
    ["c", false],           // Continuous sell
    ["continuous", false],  // Continuous sell
    ["contracts", false],   // Buy up the contracts
    ["cores", 16],          // Number of cores for grow
    ["corp", false],        // Do corporation upgrades
    ["grow", 0],            // Number of nodes for grow
    ["help", false],        // Print a friendly help message
    ["levels", 64],         // Number of levels for grow
    ["personal", false],    // personal improvement upgrades
    ["ram", 128],           // Amount of RAM for grow
    ["sell", 0],            // Sell a number of hashes
    ["sell-all", false]     // Sell all hashes
];

function Action(index, type, cost) {
    this.index = index;
    this.type = type;
    this.cost = cost;
}

/** @param {NS} _ns **/
export async function main(_ns) {
    ns = _ns;
    ns.disableLog("ALL");

    if (ns.args.length === 0) {
        help();
        return;
    }
    let options = ns.flags(argsSchema);
    if (options.help) {
        help();
        return;
    }

    if (options["sell-all"]) {
        sellAll();
        return;

    }

    if (options.sell > 0) {
        sell(n)
        return;
    }

    if (options.corp) {
        ns.tail();
        await doCorporateUpgrades();
        return;
    }

    if (options.contracts) {
        ns.tail();
        await doCodingContracts();
        return;
    }

    if (options.personal) {
        ns.tail();
        await doPersonalImprovements();
        return;
    }


    if (options.grow > 0) {
        ns.tprint("grow!");
        const nodes = options.grow;
        const levels = options.levels;
        const ram = options.ram;
        const cores = options.cores;
        const cache = options.cache;
        await growHacknet(nodes, levels, ram, cores, cache);
    }

    if (options.bb) {
        ns.tail();
        await doBladeburnerUpgrades();
        log(ns, "Now starting continuous sell");
        await continuousSell();
    }

    if (options.c || options.continuous) {
        await continuousSell();
        return;
    }

}

// print a helpful message to terminal
function help() {
    ns.tprint(`This script helps manage your hacknet servers.
USAGE: run ${ns.getScriptName()} [argument]
arguments:
--bb       : max out bladeburner upgrades
-c, --continuous : continuous sell loop
--contracts : generate coding contracts
--corp      : generate corporate upgrades
--grow n    : grow n hacknet servers
--help      : print this help message
--personal  : generate personal improvements for studying and working out
--sell n    : sell n hashes for money
--sell-all  : sell all available hashes for money.

When using --grow there are additional arguments that can control the\ngrowth of the hacknet:
--cache n   : grow to n cache for each server
--cores n   : grow to n cores for each server, default 16
--levels n  : number of levels where 1 <= n <= 200; default 64
--ram n     : n is amount of ram, power of 2, default 64`);
}

// attempt to sell n hashes
function sell(n) {
    let numToSell = n
    let numHashes = ns.hacknet.numHashes();
    if (numToSell > numHashes) {
        ns.tprintf("WARN: You only have %d hashes to sell", numHashes);
        numToSell = numHashes;
    }
    let hashCost = ns.hacknet.hashCost(SELL_FOR_MONEY);
    let num = Math.floor(numToSell / hashCost);
    let m = 0;
    for (let i = 0; i < num; i++) {
        if (ns.hacknet.spendHashes(SELL_FOR_MONEY)) {
            m += 1_000_000;
        }
    }
    log(ns, `SUCCESS: sold ${num * hashCost} hashes for ${formatMoney(m)}`, printToTerminal);
}

function sellAll(printToTerminal = true) {
    let numHashes = ns.hacknet.numHashes();
    let hashCost = ns.hacknet.hashCost(SELL_FOR_MONEY);
    let n = Math.floor(numHashes / hashCost);
    if (n == 0) {
        log(ns, "ERROR: not enough hashes to sell for money!", printToTerminal);
        return;
    }
    let m = 0;
    for (let i = 0; i < n; ++i) {
        if (ns.hacknet.spendHashes(SELL_FOR_MONEY)) {
            m += 1_000_000;
        }
    }
    log(ns, `SUCCESS: sold ${n * hashCost} hashes for ${formatMoney(m)}`, printToTerminal);
}

async function continuousSell() {
    while (true) {
        sellAll(false);
        await ns.sleep(60000);
    }
}

async function growHacknet(nodeCount, levels, ram, cores, cache) {
    log(ns, `Growing hacknet to ${nodeCount} nodes; levels =  ${levels}; ram = ${ram}; cores = ${cores}; cache = ${cache}`);
    let hashCost = ns.hacknet.hashCost(SELL_FOR_MONEY);
    let complete = false;
    let totalSpent = 0;
    while (!complete) {
        let action = null;
        complete = true;
        const availableFunds = ns.getServerMoneyAvailable("home");
        let numNodes = ns.hacknet.numNodes();

        if (numNodes < nodeCount) {
            complete = false;
            let cost = ns.hacknet.getPurchaseNodeCost();
            if (cost <= availableFunds && (action == null || cost < action.cost)) {
                action = new Action(numNodes, "PURCHASE", cost);
            }
        }

        for (let i = 0; i < numNodes; i++) {
            const node = ns.hacknet.getNodeStats(i);
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
            if (node.cache < cache) {
                complete = false;
                let cost = ns.hacknet.getCacheUpgradeCost(i, 1);
                if (cost <= availableFunds && (action == null || cost < action.cost)) {
                    action = new Action(i, "CACHE", cost);
                }
            }
        }

        if (action) {
            totalSpent += action.cost;
            if (action.type === "PURCHASE") {
                let n = ns.hacknet.purchaseNode();
                log(ns, `INFO: Purchased node ${n} for ${formatMoney(action.cost)}`);
            } else if (action.type === "LEVEL") {
                if (ns.hacknet.upgradeLevel(action.index, 1)) {
                    log(ns, `INFO: Upgraded node ${action.index} level for ${formatMoney(action.cost)}`);
                } else {
                    log(ns, `ERROR: Level upgrade for node ${action.index} failed!`);
                }
            } else if (action.type === "RAM") {
                if (ns.hacknet.upgradeRam(action.index, 1)) {
                    log(ns, `INFO: Upgraded node ${action.index} RAM for ${formatMoney(action.cost)}`);
                } else {
                    log(ns, `ERROR: RAM upgrade for node ${action.index} failed!`);
                }
            } else if (action.type === "CORE") {
                if (ns.hacknet.upgradeCore(action.index, 1)) {
                    log(ns, `INFO: Upgraded node ${action.index} core for ${formatMoney(action.cost)}`);
                } else {
                    log(ns, `ERROR: Core upgrade for node ${action.index} failed!`);
                }
            } else if (action.type === "CACHE") {
                if (ns.hacknet.upgradeCache(action.index, 1)) {
                    log(ns, `INFO: Upgraded node ${action.index} cache for ${formatMoney(action.cost)}`);
                } else {
                    log(ns, `ERROR: Cache upgrade for node ${action.index} failed!`);
                }
            }
        } else {
            if (!complete) {
                await ns.sleep(3000);
                let numHashes = ns.hacknet.numHashes();
                if (numHashes >= hashCost) {
                    sellAll(false);
                }
            }
        }
    }
    log(ns, `SUCCESS: Hacknet successfully grown to ${nodeCount} for ${formatMoney(totalSpent)}`);
    ns.toast("Hacknet growth complete!", "success");
}

async function doBladeburnerUpgrades() {
    let complete = false;
    while (!complete) {

        let rankHashCost = ns.hacknet.hashCost(EXCHANGE_FOR_BLADEBURNER_RANK);
        let rankSPCost = ns.hacknet.hashCost(EXCHANGE_FOR_BLADEBURNER_SP);
        let hashCapacity = ns.hacknet.hashCapacity();
        if (rankHashCost > hashCapacity && rankSPCost > hashCapacity) {
            // we have gone as far as we can
            complete = true;
            continue;
        }
        let numHashes = ns.hacknet.numHashes();
        if (rankHashCost < numHashes) {
            if (ns.hacknet.spendHashes(EXCHANGE_FOR_BLADEBURNER_RANK)) {
                log(ns, `INFO: Exchanged ${rankHashCost} hashes for bladeburner rank`);
            } else {
                log(ns, `ERROR: Failed to exchange hashes for bladeburner rank`, true);
            }
        } else if (rankSPCost < numHashes) {
            if (ns.hacknet.spendHashes(EXCHANGE_FOR_BLADEBURNER_SP)) {
                log(ns, `INFO: Exchanged ${rankSPCost} hashes for bladeburner skill points`);
            } else {
                log(ns, `ERROR: Failed to exchange hashes for bladeburner skill points`, true);
            }
        } else {
            await ns.sleep(3000);
        }
    }
    log(ns, "SUCCESS: Completed hacknet bladeburder upgrades", false, "success");
}

/**
 * Will attempt to buy as many upgrades provided in the list that the cache will allow.
 * @param list
 * @returns {Promise<void>}
 */
async function manageHashes(list) {
    let complete = false;
    while (!complete) {
        let hashCapacity = ns.hacknet.hashCapacity();
        let done = 0;
        for (let item of list) {
            let numHashes = ns.hacknet.numHashes();
            let itemHashCost = ns.hacknet.hashCost(item);
            if (itemHashCost < numHashes) {
                if (ns.hacknet.spendHashes(item)) {
                    log(ns, `INFO: Exchanged ${itemHashCost} hashes to ${item}`)
                } else {
                    log(ns, `ERROR: FAILED to exchange ${itemHashCost} hashes to ${item}`, true)
                }
            } else if (itemHashCost > hashCapacity) {
                done++;
            }
        }
        if (done === list.length) {
            complete = true;
            continue;
        }
        await ns.sleep(3000);
    }
}

async function doCorporateUpgrades() {
    let list = [SELL_FOR_CORPORATION_FUNDS, EXCHANGE_FOR_CORPORATION_RESEARCH];
    await manageHashes(list);
    log(ns, "SUCCESS: Completed corporate upgrades!", false, "success");
}

async function doCodingContracts() {
    let list = [GENERATE_CODING_CONTRACT];
    await manageHashes(list);
    log(ns, "SUCCESS: Completed generating coding contracts!", false, "success");
}

async function doPersonalImprovements() {
    let list = [IMPROVE_STUDYING, IMPROVE_GYM_TRAINING];
    await manageHashes(list);
    log(ns, "SUCCESS: Completed personal improvements!", false, "success");
}