/** @param {NS} ns **/
export async function main(ns) {
    
    //sets parameters for the script,
    var invites = ns.checkFactionInvitations() // what invites we have,
    var completed = []; // companies we have accepted invites from,
    var busy = ns.isBusy() //whether we're currently working,
    // and gives us both our company targets and matches each company to their respective city.
    var city = ["Sector-12", "Sector-12", "Sector-12", "Chongqing", "Volhaven", "Volhaven", "Aevum", "Aevum", "Aevum", "Aevum"]
    var company = ["Four Sigma", "Blade Industries", "MegaCorp", "KuaiGong International", "NWO", "OmniTek Incorporated", "Clarke Incorporated", "Bachman & Associates", "Fulcrum Secret Technologies", "ECorp"];    
    while (true) {
        var joined = false
        while (!joined) {
            for (var career = 0; career < company.length; career++) {
                //first, we set the loop, sticking on the first company on our array, unless we have an invite //from them already, 
                for (var i = 0; i < invites.length; i++) {
                    if (company[career] == invites) {
                        ns.joinFaction(invites);
                        ns.tprint(invites + "has been joined!");
                        completed.push(company[career]);//then  it checks if we completed that company. 
                        joined = true;
                        await ns.sleep(1000);
                        //fun fact, these times are offset strangely to help me find where the hell my code was screwing // up!
                    } else if (company[career] !== invites && company[career] !== completed[career]) {//if we haven't, // we stay with our current company.
                        career = 0
                        await ns.sleep(1100);
                    } else if (company[career] == completed[career]) {
                        //this is probably redundant, but it works so i'm not touching it.
                        ns.tprint("Transfering to " + company[career++])
                        await ns.sleep(1200)
                    }
                } if (!busy) { //if we're not working, 
                    ns.travelToCity(city[career]) //we go to our companies city, 
                    ns.tprint("Starting work at " + company[career]) // the terminal prints where we are,
                    ns.applyToCompany(company[career], "software"); //we ask nicely for a job or promotion, 
                    ns.workForCompany(company[career], "software"); // then we get to work!
                    await ns.sleep(60000); //then the script sleeps for a minute
                } else if (busy) {// if we're working,
                    ns.tprint("Payday!");// we print a fun payday on terminal,
                    ns.applyToCompany(company[career], "software");// we ask for a promotion,
                    ns.workForCompany(company[career], "software");//and get our money and get back to work,
                    await ns.sleep(60000);// then sleep for another minute.
                }
                //these are likewise also probably redundant, but i'm not touchin' them.
                else if (!joined) {
                    await ns.sleep(1300)
                } else if (joined) {
                    await ns.sleep(1400);
                }
            }
        }
    }
}