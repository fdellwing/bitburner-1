// prepare server minimizes security and maximizes money on a server.
import {log} from "./helpers"

const GROW_SCRIPT_TEXT = `export async function main(ns) {
 await ns.grow(ns.args[0]);
}`;
const growScript = "/Temp/prepare-grow.js"

const WEAKEN_SCRIPT_TEXT = `export async function main(ns) {
 await ns.weaken(ns.args[0]);
}
`;
const weakenScript = "/Temp/prepare-weaken.js";


/*
export async function main(ns) {
	var target = ns.args[0];
	var maxMoney = ns.getServerMaxMoney(target);
	ns.print("max money is " + maxMoney)
	var moneyThresh = maxMoney * 0.98;

	var securityThresh = ns.getServerMinSecurityLevel(target) + 1;
	if (ns.fileExists("BruteSSH.exe", "home")) {
		ns.brutessh(target);
	}
	ns.nuke(target);
	while (true) {
		if (ns.getServerSecurityLevel(target) > securityThresh) {
			ns.print("weakening security to " + securityThresh);
			await ns.weaken(target);
		} else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
			ns.print("growing money to " + moneyThresh);
			await ns.grow(target);
		} else {
			await ns.hack(target);
		}
	}
}
*/
/** @type import(".").NS */
let ns = null;

/** @param {NS} _ns **/
export async function main(_ns) {
    ns = _ns;
    let target = ns.args[0].toString();
    let maxMoney = ns.getServerMaxMoney(target);
    let thisServer = ns.getHostname();
    ns.print("max money is " + maxMoney)
    let moneyThresh = maxMoney * 0.98;
    let securityThresh = ns.getServerMinSecurityLevel(target) + 1;
    // check if we have rooted the server
    if (!ns.hasRootAccess(target)) {
        log(ns, `ERROR: You do not have root access to ${target}.`, true);
        return;
    }
    // create script files
    await ns.write(growScript, GROW_SCRIPT_TEXT, "w");
    await ns.write(weakenScript, WEAKEN_SCRIPT_TEXT, "w");

    let server = ns.getServer(target);
    if (!server) {
        log(ns, `ERROR: Server not found!`, true);
        return;
    }
    while (server.moneyAvailable < moneyThresh || server.hackDifficulty > securityThresh) {
        let time = 0;
        let cores = ns.getServer(thisServer).cpuCores;

        if (server.hackDifficulty > securityThresh) {
            // weaken the
            time = ns.getWeakenTime(server.hostname);
            let scriptMemoryRequired = ns.getScriptRam(weakenScript);
            let availableRam = ns.getServerMaxRam(thisServer) - ns.getServerUsedRam(thisServer);
            let availableThreads = parseInt(availableRam / scriptMemoryRequired);
            let weakenThreads = getWeakenThreads(server.hostname, server.hackDifficulty - securityThresh, availableThreads, cores);
            let id = Date.now();
            ns.run(weakenScript, weakenThreads, server.hostname, id.toString());
			log(ns,`weakening on ${server.hostname} for ${time} ms with ${weakenThreads} threads`);

        } else {
            // grow the money
            time = ns.getGrowTime(server.hostname);
			let scriptMemoryRequired = ns.getScriptRam(growScript);
			let availableRam = ns.getServerMaxRam(thisServer) - ns.getServerUsedRam(thisServer);
			let availableThreads = parseInt(availableRam / scriptMemoryRequired);
			let mult = server.moneyMax / server.moneyAvailable;
			let growThreads = ns.growthAnalyze(server.hostname, mult, cores);
			if(growThreads > availableThreads){
				growThreads = availableThreads;
			}
			let id = Date.now();
			ns.run(growScript, growThreads, server.hostname, id.toString());
			log(ns,`growing on ${server.hostname} for ${time} ms with ${growThreads} threads`);
        }

        time += 250;
        await ns.sleep(time);
        server = ns.getServer(target);
    }

    ns.toast(`${target} is prepared for hack attack!`, "success");
}

function getWeakenThreads(host, difference, maxThreads, cores) {
    for (let i = 1; i < maxThreads; i++) {
        if (ns.weakenAnalyze(i, cores) >= difference) {
            return i;
        }
    }
    return maxThreads;
}

