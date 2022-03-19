/** @type import(".").NS */
let ns = null;
var scriptName = "early-hack2.js"; // Still using it
var scriptMemoryRequired;
var threadPool = 0;
var targetThreadsPerProcess = 2000;
var avgThreadsPerProcess = 0;
let visited = [];
let targetNodes = [];
let myHackLevel = 0;

/** @type import(".").Server */
let target = null;

/** @param {NS} _ns **/
export async function main(_ns) {    
    ns = _ns;
    if(ns.args.length==0){
        return;
    }    
    myHackLevel = ns.getHackingLevel();
    scriptMemoryRequired = ns.getScriptRam(scriptName);
    var availableRam = ns.getServerMaxRam("home") - ns.getServerUsedRam("home");
    threadPool = parseInt(availableRam / scriptMemoryRequired);
    visited.push("home");
    processHost("home");
    
    ns.tprintf("thread pool = %d", threadPool);
    ns.tprintf("attacking %d nodes", targetNodes.length)

    if (targetNodes.length > 0) {
        avgThreadsPerProcess = parseInt(threadPool / targetNodes.length);
    }
    if (avgThreadsPerProcess > targetThreadsPerProcess) {
        targetThreadsPerProcess = avgThreadsPerProcess;
    }
    
    ns.tprintf("Max threads per: %d", targetThreadsPerProcess);
    targetNodes.sort(function (a, b) {
        if (a.moneyMax < b.moneyMax) {
            return -1;
        }
        if (a.moneyMax > b.moneyMax) {
            return 1;
        }
        return 0;
    });

    for (let node of targetNodes) {
        if (threadPool == 0)
            break;
        target = node;
        var threadNum = ns.hackAnalyzeThreads(target.hostname, target.moneyMax / 3);
        if (!isFinite(threadNum) || isNaN(threadNum) || threadNum <= 0) {
            threadNum = avgThreadsPerProcess;
        }
        if (threadNum > threadPool) {
            threadNum = threadPool;
        }
        threadPool -= threadNum;
        ns.exec(scriptName, "home", threadNum, target.hostname, ns.args[0]);
        ns.tprintf("Attacking %s with %d threads looking for $%d.", target.hostname, threadNum, target.moneyMax);
        ns.printf("Attacking %s with %d threads looking for $%d.", target.hostname, threadNum, target.moneyMax);
    }
    ns.toast("Done spinning home!");
}


// scan for all hosts then process each that hasn't been visited yet.
function processHost(hostname) {
    // scan for neigbors
    var nodes = ns.scan(hostname);
    for (let node of nodes) {

        if (visited.includes(node)) {
            continue; // already been here
        }
        visited.push(node);
        var server = ns.getServer(node);

        if (server.requiredHackingSkill <= myHackLevel && server.moneyMax > 0) {
            targetNodes.push(server);
        }

        processHost(node); // recursively process nodes        
    }
}
