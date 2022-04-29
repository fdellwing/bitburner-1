import { getAllServers } from "get-servers.js";

/*
    1) Get All Servers
    2) For each server:
        a) If can hack add to list of targets
        b) If can nuke nuke it and add to list of worknodes
    3) Sort list of targets into decscending order by max money.
    3) For each worknode:
        a) scp infinity scripts
        b) start scripts remotely
*/
const HACK_SCRIPT = "infinity-hack.js";
const GROW_SCRIPT = "infinity-grow.js";
const WEAKEN_SCRIPT = "infinity-weaken.js";
let canBruteSsh = false;
let canFtpCrack = false;
let canRelaySmtp = false;
let canHttpWorm = false;
let canSqlInject = false;

const argsSchema = [
    ["h", false],           // include hacknet servers
    ["help", false],        // Print a friendly help message
    ["p", false]            // Include personal servers
];


/** @type import(".").NS */
let ns = null;

/** @param {NS} _ns **/
export async function main(_ns) {

    ns = _ns;
    ns.disableLog("ALL");
    let options = ns.flags(argsSchema);
    const includeHashnet = options.h;
    const includePersonal = options.p;
    let portAttackCount = checkForLocalPrograms();
    let servers = getAllServers(ns, "home", true);
    const myHackLevel = ns.getHackingLevel();
    ns.printf("My hack level: %d", myHackLevel);
    let workNodes = [];
    let targets = [];
    for (let server of servers) {
        if(server==="home"){
            continue;
        }
        // 
        let node = ns.getServer(server);
        if(node.purchasedByPlayer){
            ns.tprintf("%s is player owned", node.hostname);
            if(server.startsWith("hacknet")){
                if(includeHashnet){
                    workNodes.push(node);
                }
                else{
                    ns.tprintf("ignoring %s", server);
                }
            } else {
                if(includePersonal){
                    workNodes.push(node);
                }
                else{
                    ns.tprintf("ignoring %s", server);
                }
            }
            continue;
        }
        let workable = false;
        let hackable = false;            
        if (node.hasAdminRights || portAttackCount >= node.numOpenPortsRequired) {
            workNodes.push(node);
            workable = true;
        } 
        if (workable && myHackLevel >= ns.getServerRequiredHackingLevel(server)) {
            targets.push(node);
            hackable = true;
        }
        ns.tprintf("%s: work node: %t; hackable: %t", node.hostname, workable, hackable);
    }
    if (targets.length == 0 || workNodes.length == 0) {
        ns.tprintf("ERROR: unable to hack today! target num: %d, work node num = %d", targets.length, workNodes.length);
    } else {
        ns.tprintf("Worknodes: %d; Targets: %d", workNodes.length, targets.length);
    }

    targets.sort(function (a, b) {
        if (a.moneyMax < b.moneyMax) {
            return 1;
        }
        if (a.moneyMax > b.moneyMax) {
            return -1;
        }
        return 0;
    });

    // Get admin rights on all worknodes first. This should
    // unlock targets as well.
    for(let node of workNodes){
        if (!node.hasAdminRights) {
            nukeHost(node.hostname);
        }
    }

    for (let node of workNodes) {

        if (!ns.fileExists(HACK_SCRIPT, node.hostname)) {
            await ns.scp(HACK_SCRIPT, node.hostname);
        }
        if (!ns.fileExists(GROW_SCRIPT, node.hostname)) {
            await ns.scp(GROW_SCRIPT, node.hostname);
        }
        if (!ns.fileExists(WEAKEN_SCRIPT, node.hostname)) {
            await ns.scp(WEAKEN_SCRIPT, node.hostname);
        }

        for (let target of targets) {
            if (!attack(node.hostname, target.hostname)) {
                break;
            }
        }
    }
}

function attack(server, target) {
    
    let scriptMemoryRequired = ns.getScriptRam(GROW_SCRIPT);
    let availableRam = ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
    let threads = parseInt(availableRam / scriptMemoryRequired);
    if (threads <= 3) {
        return false;
    }
    let hackThreads = ns.hackAnalyze(server);
    if (hackThreads > 0) {
        hackThreads = parseInt(.10 / hackThreads) + 1; // 10% of full hack
    } else {
        hackThreads = 1;
    }
    let growThreads = parseInt(ns.growthAnalyze(server, 4)) + 1;
    if(isNaN(growThreads)){
        growThreads = 1;
    }
    let weakenThreads = hackThreads * 2;
    if (threads < hackThreads + growThreads + weakenThreads) {
        let total = hackThreads + growThreads + weakenThreads;
        hackThreads = parseInt((hackThreads / total) * threads);
        if (hackThreads < 1) {
            hackThreads = 1;
        }
        growThreads = parseInt((growThreads / total) * threads);
        weakenThreads = threads - (hackThreads + growThreads);
        if (weakenThreads < 1) {
            weakenThreads = 1;
            growThreads--;
        }        
    }
    if(isNaN(hackThreads) || hackThreads == 0){
        hackThreads = 1;
    }
    if(isNaN(growThreads) || growThreads == 0){
        growThreads = 1;
    }
    if(isNaN(weakenThreads)|| weakenThreads == 0){
        weakenThreads = 1;
    }
    let id = Date.now();
    ns.tprintf("%s infinity hacking %s; hack: %d; grow: %d; weaken: %d", server, target, hackThreads, growThreads, weakenThreads);
    ns.exec(HACK_SCRIPT, server, hackThreads, "--target", target, "--id", id);
    ns.exec(GROW_SCRIPT, server, growThreads, "--target", target, "--id", id);
    ns.exec(WEAKEN_SCRIPT, server, weakenThreads, "--target", target, "--id", id);    
    return hackThreads + growThreads + weakenThreads + 3 < threads;
}

// nuke the host for root access
function nukeHost(hostname) {
    if (canBruteSsh)
        ns.brutessh(hostname);
    if (canFtpCrack)
        ns.ftpcrack(hostname);
    if (canRelaySmtp)
        ns.relaysmtp(hostname);
    if (canHttpWorm)
        ns.httpworm(hostname);
    if (canSqlInject)
        ns.sqlinject(hostname);
    ns.nuke(hostname);
    ns.tprintf("%s nuked!", hostname);
}

// check for installed hacking programs. 
function checkForLocalPrograms() {
    let portAttackCount = 0;
    if (ns.fileExists("BruteSSH.exe", "home")) {
        portAttackCount++;
        canBruteSsh = true;
    }
    if (ns.fileExists("FTPCrack.exe", "home")) {
        portAttackCount++;
        canFtpCrack = true;
    }
    if (ns.fileExists("relaySMTP.exe", "home")) {
        portAttackCount++;
        canRelaySmtp = true;
    }
    if (ns.fileExists("HTTPWorm.exe", "home")) {
        portAttackCount++;
        canHttpWorm = true;
    }
    if (ns.fileExists("SQLInject.exe", "home")) {
        portAttackCount++;
        canSqlInject = true;
    }
    ns.printf("Attacks: %d", portAttackCount);
    ns.print("canBruteSsh: " + canBruteSsh);
    ns.print("canFtpCrack: " + canFtpCrack);
    ns.print("canRelaySmtp: " + canRelaySmtp);
    ns.print("canHttpWorm: " + canHttpWorm);
    ns.print("canSqlInject: " + canSqlInject);
    return portAttackCount;
}