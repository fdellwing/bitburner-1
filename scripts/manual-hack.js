/*
    Script: manual-hack.js
    Author: KodeMonkey
    Description:
        This program will use singularity functions to go to a targeted server and manually hack it.

        Why do this you ask?

        Because this is one way to increase intelligence, and if you want to get to 255 INT then
        this is way easier than creating programs. Each manual hack will give you a tiny
        bit of intelligence, but put that in a for loop, and it will build up fast.

    Algo:
        1) make sure we can hack the server
        2) stop any running scripts on the server
        3) copy our tools to the server, and start them up
        4) goto the server
        5) hack the server
        6) goto 5
 */
import {formatMoney} from "./helpers";
/** @type import(".").NS */
let ns = null;
let canBruteSsh = false;
let canFtpCrack = false;
let canRelaySmtp = false;
let canHttpWorm = false;
let canSqlInject = false;

const argsSchema = [
    ["help", false],
    ["target", "joesguns"]
];

// we set the server itself to grow and weaken itself with these scripts
const GROW_SCRIPT = "infinity-grow.js";
const WEAKEN_SCRIPT = "infinity-weaken.js";

/** @param {NS} _ns **/
export async function main(_ns) {
    ns = _ns;
    const args = ns.flags(argsSchema);
    if(args.help){
        printHelp();
    }
    let server = args.target;

    // 1) make sure we can hack the server
    const myHackLevel = ns.getHackingLevel();
    let portAttackCount = checkForLocalPrograms();
    let node = ns.getServer(server);

    if (!node.hasAdminRights && portAttackCount < node.numOpenPortsRequired) {
        ns.tprint("ERROR: You can't achieve admin rights on this server. Get more programs, bud!");
        return;
    }
    let requiredHackingLeve = ns.getServerRequiredHackingLevel(server);
    if (myHackLevel < requiredHackingLeve) {
        ns.tprint(`ERROR: You can't hack ${server}. Raise your hacking level to ${requiredHackingLeve}`);
        return;
    }
    if (!node.hasAdminRights) {
        nukeHost(node.hostname);
    }

    // 2) stop any running scripts on the server
    ns.killall(node.hostname);

    // 3) copy our set of tools to the server, start them up
    if (!ns.fileExists(GROW_SCRIPT, node.hostname)) {
        await ns.scp(GROW_SCRIPT, node.hostname);
    }
    if (!ns.fileExists(WEAKEN_SCRIPT, node.hostname)) {
        await ns.scp(WEAKEN_SCRIPT, node.hostname);
    }
    runScripts(node.hostname);

    // 4) goto the server
    let route = [];
    recursiveScan('', 'home', server, route);
    let jump = 0;
    for (const i in route) {
        jump++;
        await ns.sleep(250);
        const extra = i > 0 ? "└ " : "";
        ns.tprint(`${" ".repeat(i)}${extra}[${jump}] ${route[i]}`);
        ns.connect(route[i]);
    }
    let player = ns.getPlayer();
    let startingIntelligence = player.intelligence;
    let currentIntelligence = player.intelligence;
    let hackCount = 0;
    let totalMoney = 0;
    // 5) hack the server
    while(true){
        ns.tail(); // just in case we accidentally close the window. We can only kill the script from the tail window.
        let hackChance = ns.hackAnalyzeChance(node.hostname);
        if(hackChance<0.75){
            ns.tprint(`weakening server! hack chance = ${hackChance}`);
            continue;
        }
        let money = await ns.manualHack();
        totalMoney += money;
        hackCount++;
        player = ns.getPlayer();
        let intelligenceDiff = player.intelligence - currentIntelligence;
        currentIntelligence = player.intelligence;
        ns.clearLog();

        ns.print(`Hack count: ${hackCount}`);
        ns.print(`Last hack money: ${formatMoney(money)}`);
        ns.print(`Total money earned: ${formatMoney(totalMoney)}`);
        ns.print(`INT: ${player.intelligence.toPrecision(4)}`);
        ns.print(`Last INT gain: ${intelligenceDiff.toPrecision(4)}`);
        ns.print(`Total INT gain: ${currentIntelligence - startingIntelligence}`)
        // 6) goto 5
    }

}

function printHelp(){
    ns.tprint(`This script will take over and manually hack the shit out of server.
USAGE: run ${ns.getScriptName()} [argument]
arguments:
--help      : print this help message
--target    : the target server, default is joesguns`);
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
    return portAttackCount;
}

function runScripts(target) {
    let server = target;
    let scriptMemoryRequired = ns.getScriptRam(GROW_SCRIPT);
    let availableRam = ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
    let threads = parseInt((availableRam / scriptMemoryRequired).toString());
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
    if(isNaN(hackThreads) || hackThreads === 0){
        hackThreads = 1;
    }
    if(isNaN(growThreads) || growThreads === 0){
        growThreads = 1;
    }
    if(isNaN(weakenThreads)|| weakenThreads === 0){
        weakenThreads = 1;
    }
    let id = Date.now();
    //ns.exec(GROW_SCRIPT, server, growThreads, "--target", target, "--id", id);
    ns.exec(WEAKEN_SCRIPT, server, weakenThreads + hackThreads + growThreads, "--target", target, "--id", id);
    return hackThreads + growThreads + weakenThreads + 3 < threads;
}

function recursiveScan(parent, server, target, route) {
    const children = ns.scan(server);
    for (let child of children) {
        if (parent === child) {
            continue;
        }
        if (child.toLowerCase() === target.toLowerCase()) {
            route.unshift(child);
            route.unshift(server);
            return true;
        }

        if (recursiveScan(server, child, target, route)) {
            route.unshift(server);
            return true;
        }
    }
    return false;
}