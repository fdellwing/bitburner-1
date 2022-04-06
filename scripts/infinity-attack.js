/** @type import(".").NS */
let ns = null;
const HACK_SCRIPT = "infinity-hack.js";
const GROW_SCRIPT = "infinity-grow.js";
const WEAKEN_SCRIPT = "infinity-weaken.js";
let canBruteSsh = false;
let canFtpCrack = false;
let canRelaySmtp = false;
let canHttpWorm = false;
let canSqlInject = false;
/** @param {NS} _ns **/
export async function main(_ns) {
    ns = _ns;
    const scriptName = "infinity-grow.js";
    const data = ns.flags([
        ["target", ""],  // --target => the target (hostname) of the attack
        ["threads", 0],  // --threads => number of threads to use
        ["max", false],  // --max => use max available threads
        ["id", 0]        // --id => process id you use, useful for killing the right process.
    ]);

    // Make sure arguments make sense.
    if (data.target == "") {
        ns.tprint("No target provided, exiting now.")
        return;
    }
    if(data.threads > 0 && data.max){
        ns.print("You can't request max threads then specify thread count. Use either --threads or --max, not both");
        return;
    }

    let server = data.target;
    // Check hack level
    const myHackLevel = ns.getHackingLevel();
    const requiredHackLevel = ns.getServerRequiredHackingLevel(server);
    if (myHackLevel < ns.getServerRequiredHackingLevel(server)) {
        ns.tprintf("ERROR: %s requires hack level %d, you only have %d", server, requiredHackLevel, myHackLevel);
        ns.exit();
        return;
    }
    let node = ns.getServer(server);
    if (!node.hasAdminRights) {
        // Need admin rights, can Nuke?
        let portAttackCount = checkForLocalPrograms();
        if (portAttackCount < node.numOpenPortsRequired) {
            nukeHost(node.hostname);
        } else {
            ns.tprintf("ERROR: %s requires %d ports open to nuke, you can only open %d", node.hostname, node.numOpenPortsRequired, portAttackCount);
            ns.exit();
            return;
        }
    }

    // There must be atlease 1 of each type of operation (hack, grow, weaken)
    // If there is not enough memory for 3 threads, we error out.
    let scriptMemoryRequired = ns.getScriptRam(scriptName);
    let availableRam = ns.getServerMaxRam("home") - ns.getServerUsedRam("home");
    const threadsAvailable = parseInt(availableRam / scriptMemoryRequired);
    if(threadsAvailable < 3){
        ns.tprintf("ERROR: Not enough memory availabl to attack %s", server);
        ns.exit();
        return;
    }    


    let hackThreads = ns.hackAnalyze(server);
    if (hackThreads > 0) {
        hackThreads = parseInt(.10 / hackThreads) + 1; // 10% of full hack
    } else {
        hackThreads = 1;
    }

    let growThreads = parseInt(ns.growthAnalyze(server, 4)) + 1;
    if (isNaN(growThreads) || growThreads < 1) {
        growThreads = 1;
    }    
    let weakenThreads = hackThreads * 2;
    

    let threads = data.threads;    
    if(data.max || threads > threadsAvailable){
        threads = threadsAvailable;
    }

    if (threads > 0 || hackThreads + growThreads + weakenThreads > threadsAvailable) {
        if(threads == 0) {
            threads = threadsAvailable;
        }
        let total = hackThreads + growThreads + weakenThreads;
        hackThreads = parseInt((hackThreads / total) * threads);
        if (hackThreads < 1) {
            hackThreads = 1;
        }
        growThreads = parseInt((growThreads / total) * threads);
        if (isNaN(growThreads) || growThreads < 1) {
            growThreads = 1;
        }    
        weakenThreads = threads - (hackThreads + growThreads);
        if (weakenThreads < 1) {
            weakenThreads = 1;
            growThreads--;
        }
    }

    let id = data.id;
    if (id == 0) {
        id = Date.now();
    }
    ns.tprintf("Attacking %s with %d hack; %d grow; %d weaken threads.", server, hackThreads, growThreads, weakenThreads);
    ns.exec("infinity-hack.js", "home", hackThreads, "--target", server, "--id", id);
    ns.exec("infinity-grow.js", "home", growThreads, "--target", server, "--id", id);
    ns.exec("infinity-weaken.js", "home", weakenThreads, "--target", server, "--id", id);
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