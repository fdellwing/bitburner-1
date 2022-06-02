// perpare server minimizes security and maximizes money on a server.
/** @param {NS} ns **/
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