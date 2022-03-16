/** @type import(".").NS */
let ns = null;
let attackScript = "early-hack.js"
let visited = [];
let workNodes = [];
let currentMax = 0;
let currentTarget = "n00dles";
let requiredScriptMemory = 0.0;
var portAttackCount = 0;	// number of attackable ports 
let canBruteSsh = false;
let canFtpCrack = false;
let canRelaySmtp = false;
let canHttpWorm = false;
let canSqlInject = false;
let myHackLevel = 0;

/** @param {NS} _ns **/
export async function main(_ns) {
    ns = _ns;    
    ns.disableLog("getServerMaxRam");
    ns.disableLog("getServerUsedRam");
    ns.disableLog("scp");
    ns.disableLog("exec");
    myHackLevel = ns.getHackingLevel();
    visited.push("home");
    if(!ns.fileExists(attackScript)){
        ns.tprintf("%s script not found!", attackScript);
        return;
    }
    requiredScriptMemory = ns.getScriptRam(attackScript);
    checkForLocalPrograms();

    // step 1 -- scan all nodes in a depth first manner
    processHost("home");

    // step 2 -- use available servers to attack the current target
    await fuckupCurrentTarget();

}

// scan for all hosts then process each that hasn't been visited yet.
function processHost(hostname){
    // scan for neigbors
    var nodes = ns.scan(hostname); 
    for (let node of nodes) {
        
        if(visited.includes(node)){
            continue; // already been here
        }

        var hackLevelReq = ns.getServerRequiredHackingLevel(node);
        var isHackable = hackLevelReq <= myHackLevel;
        visited.push(node);
        ns.printf("%s hack level = %d; is hackable = %t",node ,hackLevelReq, isHackable);
        ns.tprintf("%s hack level = %d; is hackable = %t",node ,hackLevelReq, isHackable);
        if(!ns.hasRootAccess(node)){
            nukeHost(node);
            if(ns.hasRootAccess(node)){
                ns.printf("Rooted %s", hostname);
                // double check we have root access before pushing on work detail
                workNodes.push(node)
            }
        } else {
            workNodes.push(node)
        }
        
        // check if node is hackable
        if(isHackable){            
            var minSecurity = ns.getServerMinSecurityLevel(node);
            if(minSecurity==0){
                minSecurity=1;
            }
            var x = ns.getServerMaxMoney(node) / minSecurity;
            if(x > currentMax){
                currentMax = x;
                currentTarget = node; // set the current target to new juicy node
            }
        }

        processHost(node); // recursively process nodes        
    }
}

// nuke the host for root access
function nukeHost(hostname){
    if(canBruteSsh)
        ns.brutessh(hostname);
    if(canFtpCrack)
        ns.ftpcrack(hostname);
    if(canRelaySmtp)
        ns.relaysmtp(hostname);
    if(canHttpWorm)
        ns.httpworm(hostname);
    if(canSqlInject)
        ns.sqlinject(hostname);
    ns.nuke(hostname);
}

function checkForLocalPrograms() {
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
	ns.print("canBruteSsh: ", canBruteSsh);
    ns.print("canFtpCrack: ", canFtpCrack);
    ns.print("canRelaySmtp: ", canRelaySmtp);
    ns.print("canHttpWorm: ", canHttpWorm);
    ns.print("canSqlInject: ", canSqlInject);
}

async function fuckupCurrentTarget(){
    ns.printf("Attacking %s", currentTarget);
    for(let node of workNodes){
        var availableRam = ns.getServerMaxRam(node) - ns.getServerUsedRam(node);
        if(availableRam >= requiredScriptMemory){
            var threads = parseInt(availableRam/requiredScriptMemory);
            await ns.scp(attackScript, node)
            ns.exec(attackScript, node, threads, currentTarget);
            //ns.printf("Executing %s on %s with %d threads", attackScript, node, threads);
        }
    }
}