/*
 * The idea behin this script is start commiting crimes, starting with the easiest
 * and progressing to homicide. Once we start commiting homicides we kill people 
 * until we commit 18k murders, then quit. 
 */
const crimes = [
    "heist",
    "assassination",
    "kidnap",
    "grand theft auto",
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

/** @param {import(".").NS } ns */
export async function main(_ns) {
    ns = _ns;
    // Disable the log
    ns.disableLog("ALL");
    murders = 0;
    crimesCommitted = 0;
    ns.tail(); // Open a window to view the status of the script
    let timeout = 250; // In ms - too low of a time will result in a lockout/hang
    let isKillingTime = false;
    while (true) {
        await ns.sleep(timeout); // Wait it out first
        if (ns.isBusy()) continue;
        if(isKillingTime){
            commitCrime("homicide");
            continue;
        }
        /** Calculate the risk value of all crimes */
        let choices = crimes.map((crime) => {
            let p = ns.getPlayer();            
            let crimeStats = ns.getCrimeStats(crime); // Let us look at the important bits            
            let crimeChance = ns.getCrimeChance(crime); // We need to calculate if its worth it            
            /** Using probabilty(odds) to calculate the "risk" to get the best reward
             *      Risk Value = Money Earned * Odds of Success(P(A) / ~P(A)) / Time taken
             *
             *  Larger risk values indicate a better choice
             */
            let crimeRiskValue =
                (crimeStats.money * Math.log10(crimeChance / (1 - crimeChance + Number.EPSILON))) /
                crimeStats.time;
            return [crime, crimeRiskValue];
        });

        let bestCrime = choices.reduce((prev, current) => {
            return prev[1] > current[1] ? prev : current;
        });

        if(ns.getCrimeChance("homicide")==1 || bestCrime[0]=="homicide"){            
            isKillingTime = true;
            ns.toast("It's killing time!")
        }

        commitCrime(bestCrime[0]);
    }
}

function commitCrime(crime){
    ns.commitCrime(crime);
    crimesCommitted++;
    if(crime=="homicide"){
        murders++;
    }
    let stats = ns.getCrimeStats(crime);
    let player = ns.getPlayer();
    ns.clearLog();
    if(crime!="homicide"){
        let ch  =ns.getCrimeChance("homicide");
        ns.printf("Murder chance: %f", ch);
    }
    ns.printf("Crimes comitted this session: %d", crimesCommitted);
    ns.printf("Murders this session: %d", murders);
    ns.printf("Kills: %d", player.numPeopleKilled);
    ns.print(
        `Crime: ${crime} Cash to Earn: \$${stats.money.toPrecision(4)}`
    );    
}