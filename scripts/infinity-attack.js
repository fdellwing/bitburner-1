/** @type import(".").NS */
let ns = null;

/** @param {NS} _ns **/
export async function main(_ns) {
    ns = _ns;
    const scriptName = "infinity-grow.js";
    const data = ns.flags([
        ["target", ""],  // --target => the target (hostname) of the attack
        ["threads", 0],  // --threads => number of threads to use
        ["max", false],   // --max => use max available threads
        ["id", 0]
    ]);

    let threads = data.threads;
    if(data.max){
        let scriptMemoryRequired = ns.getScriptRam(scriptName);
        let availableRam = ns.getServerMaxRam("home") - ns.getServerUsedRam("home");
        threads = parseInt(availableRam / scriptMemoryRequired);
    }
    if (data.target == "") {
        ns.tprint("No target provided, exiting now.")
        return;
    }

    let server = data.target;
    let hackThreads = ns.hackAnalyze(server);
    if (hackThreads > 0) {
        hackThreads = parseInt(.10 / hackThreads) + 1; // 10% of full hack
    } else {
        hackThreads = 1;
    }
    let growThreads = parseInt(ns.growthAnalyze(server, 4)) + 1;
    let weakenThreads = hackThreads * 2;
    if (threads > 0) {
        let total = hackThreads + growThreads + weakenThreads;
        hackThreads = parseInt((hackThreads / total) * threads);
        if(hackThreads<1){
            hackThreads = 1;
        }
        growThreads = parseInt((growThreads / total) * threads);
        weakenThreads = threads - (hackThreads + growThreads);
        if(weakenThreads < 1){
            weakenThreads = 1;
            growThreads--;
        }
    }    
    
    let id = data.id;
    if(id==0){
        id = Date.now();
    }
    ns.tprintf("Attacking %s with %d hack; %d grow; %d weaken threads.", server, hackThreads, growThreads, weakenThreads);
    ns.exec("infinity-hack.js", "home", hackThreads, "--target", server, "--id", id);
    ns.exec("infinity-grow.js", "home", growThreads, "--target", server, "--id", id);
    ns.exec("infinity-weaken.js", "home", weakenThreads, "--target", server, "--id", id);
}