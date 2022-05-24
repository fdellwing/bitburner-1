/*
 * The idea behin this script is start commiting crimes, starting with the easiest
 * and progressing to homicide. Once we start commiting homicides we kill people 
 * until we have enough negative karma, then launch the manage-combat-gang.js 
 * script with the -c flag to create a new gang. 
 */
import { formatMoney } from "./helpers";
const crimes = [
    "homicide",
    "larceny",
    "mug someone",
    "rob store",
    "shoplift",
];
let murders = 0;
let crimesCommitted = 0;
/** @type import(".").NS */
let ns = null;
const GANG_THRESHOLD = -1000000;

/** @param {import(".").NS } _ns */
export async function main(_ns) {
    ns = _ns;
    // Disable the log
    ns.disableLog("ALL");
    murders = 0;
    crimesCommitted = 0;
    ns.tail(); // Open a window to view the status of the script
    let timeout = 250; // In ms - too low of a time will result in a lockout/hang
    let isKillingTime = false;
    let run = true;
    while (run) {
        await ns.sleep(timeout); // Wait it out first
        if (ns.isBusy()) continue;
        let theCrime = "homicide";
        if (!isKillingTime) {
            // Calculate the risk value of all crimes
            let choices = crimes.map((crime) => {
                let p = ns.getPlayer();
                let crimeStats = ns.getCrimeStats(crime); // Let us look at the important bits
                let crimeChance = ns.getCrimeChance(crime); // We need to calculate if its worth it
                let crimeRiskValue = (crimeStats.money * Math.log10(crimeChance / (1 - crimeChance + Number.EPSILON))) / crimeStats.time;
                return [crime, crimeRiskValue];
            });

            let bestCrime = choices.reduce((prev, current) => {
                return prev[1] > current[1] ? prev : current;
            });

            if (ns.getCrimeChance("homicide") === 1 || bestCrime[0] === "homicide") {
                isKillingTime = true;
                ns.toast("It's killing time!")
            }
            theCrime = bestCrime[0];
        }
        let karma = commitCrime(theCrime);
        if (karma < GANG_THRESHOLD) {
            ns.printf("SUCCESS: killed a million!");
            run = false;
        }
    }
}

function commitCrime(crime) {
    ns.commitCrime(crime);
    crimesCommitted++;
    if (crime === "homicide") {
        murders++;
    }
    let stats = ns.getCrimeStats(crime);
    let player = ns.getPlayer();
    ns.clearLog();
    ns.tail(); // just in case we accidentally close the window. We can only kill the script from the tail window.
    if (crime !== "homicide") {
        let ch = ns.getCrimeChance("homicide");
        ns.printf("Murder chance: %f", ch);
    }
    let karma = ns.heart.break();
    ns.printf("Crimes comitted this session: %d", crimesCommitted);
    ns.printf("Murders this session: %d", murders);
    ns.printf("Kills: %d", player.numPeopleKilled);
    ns.printf("Karma: %d", karma);
    ns.print(
        `Crime: ${crime} Cash to Earn: ${formatMoney(stats.money)}`
    );
    return karma;
}