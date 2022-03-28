/** @type import(".").NS */
let ns = null;

/** @param {NS} _ns **/
export async function main(_ns) {
    ns = _ns;
    const data = ns.flags([
        ["target", ""],
        ["threads", 0]
    ]);
    if (data.target == "") {
        ns.tprint("No target provided, exiting now.")
        return;
    }
    let server = data.target;
    let hackThreads = parseInt(.10 / ns.hackAnalyze(server)) + 1;
    let growThreads = parseInt(ns.growthAnalyze(server, 4)) + 1;
    let weakenThreads = hackThreads * 2;
    if (data.threads > 0) {
        let total = hackThreads + growThreads + weakenThreads;
        hackThreads = parseInt((hackThreads / total) * data.threads);
        growThreads = parseInt((growThreads / total) * data.threads);
        weakenThreads = data.threads - (hackThreads + growThreads);
    }
    ns.tprintf("Attacking %s with %d hack; %d grow; %d weaken threads.", server, hackThreads, growThreads, weakenThreads);
    ns.exec("infinity-hack.js", "home", hackThreads, "--target", server);
    ns.exec("infinity-grow.js", "home", growThreads, "--target", server);
    ns.exec("infinity-weaken.js", "home", weakenThreads, "--target", server);

}