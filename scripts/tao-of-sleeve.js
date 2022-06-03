/*
    Script: tao-of-sleeve.js
    Author: KodeMonkey
    Description:
        I don't understand sleeves, but I know I want to control them. This script controls my sleeves.
    Notes:
        There is a maximum number of 8 sleeves, so instead of calling them by number I will give
        each one a name in alphabetical order.
 */
import {log, formatMoney} from "./helpers";

/** @type import(".").NS */
let ns = null;
const argsSchema = [

    ["calculate-crime", ""],        // calculate optimal stats to commit a crime
    ["calculate-money", false],     // calculate the money required to get all available augmentations.
    ["help", false],
    ['disable-training', false],    // Set to true to disable having sleeves workout at the gym (costs money)
    ["purchase", false],            // purchase available augmentations for sleeve
    ["sleeve", -1],                 // only use sleeve n
    ['train-to-strength', 105],     // Sleeves will go to the gym until they reach this much Str
    ['train-to-defense', 105],      // Sleeves will go to the gym until they reach this much Def
    ['train-to-dexterity', 70],     // Sleeves will go to the gym until they reach this much Dex
    ['train-to-agility', 70],       // Sleeves will go to the gym until they reach this much Agi
]

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

// These are the names a gave me sleeves, only for IO purposes
const sleeveNames = [
    "Adam",
    "Blade",
    "Connor",
    "Deckard",
    "Elliot",
    "Flynn",
    "Gibson",
    "Hendrix"
];

const works = ['security', 'field', 'hacking']; // When doing faction work, we prioritize physical work since sleeves tend towards having those stats be highest
const trainStats = ['strength', 'defense', 'dexterity', 'agility'];

const sleeveDataFile = '/Data/sleeve-data.txt';
let numSleeves;
let focusSleeve = -1;

/**
 * Cached sleeve data.
 * @param {SleeveSkills} stats
 * @param {number} id numeric id of the Sleeve
 * @param {string} name name of the Sleeve
 * @constructor
 */
function SleeveData(stats, id, name){
    //~~~~~~~~~~ FROM SleeveSkills ~~~~~~~~~~~~~~~~~~
    this.id = id;
    this.name = name;
    this.agility = stats.agility;
    this.charisma = stats.charisma;
    this.defense = stats.defense;
    this.dexterity = stats.dexterity;
    this.hacking = stats.hacking;
    this.shock = stats.shock;
    this.strength = stats.strength;
    this.sync = stats.sync;
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    // when isReset is set to true, the sleeve must start retraining itself
    // starting with quickSkillUp, then with focusedTraining if minimum skill thresholds
    // have not been met.
    this.isReset = true;
    this.currentTask = "";
}

/** @type {SleeveData[]} */
 let sleeveCache = [];

/** @param {NS} _ns **/
export async function main(_ns) {
    ns = _ns;
    ns.disableLog("ALL");
    let options = ns.flags(argsSchema);
    if(options.help){
        printHelp();
        return;
    }
    focusSleeve = options.sleeve;
    if(focusSleeve > 8){ focusSleeve = 8;}
    try { numSleeves = ns.sleeve.getNumSleeves();}
    catch { return ns.print("ERROR: User does not appear to have access to sleeves. Exiting..."); }

    if(options["calculate-crime"]!==""){
        calculateOptimalStatsForCrime(options["calculate-crime"]);
        return;
    }

    if(options["calculate-money"]){
        printAllSleeveAugmentations();
        return;
    }

    if(options[""])

    sleeveCache = [];
    await loadDataFromCache();

    if(options["purchase"]){
        ns.tail();
        for(let s of sleeveRange()){
            let total = purchaseAvailableAugmentations(s.id, true);
            if(total > 0){
                log(ns, `SUCCESS: ${s.name} purchased ${formatMoney(total)} worth of augmentations`, true);
            } else {
                log(ns,`WARN: ${s.name} purchased ${formatMoney(total)} worth of augmentations`, true)
            }
        }
        return;
    }
}

/**
 * Generator for the range of sleeves valid for this context
 * @returns {Generator<SleeveData, void, *>}
 */
function* sleeveRange() {
    if(focusSleeve>=0){
        yield sleeveCache[focusSleeve];
    } else {
        for(let i = 0; i < numSleeves; ++i){
            yield sleeveCache[i];
        }
    }
}

async function loadDataFromCache() {
    if(ns.fileExists(sleeveDataFile)){
        let data = await ns.read(sleeveDataFile);
        let a = JSON.parse(data);
        sleeveCache = a.map((e,i)=>new SleeveData(e,i,sleeveNames[i]));
    } else {
        let sleeveNum = ns.sleeve.getNumSleeves();
        for(let i = 0; i < sleeveNum; i++){
            let newSleeve = new SleeveData(ns.sleeve.getSleeveStats(i), i, sleeveNames[i]);
            sleeveCache.push(newSleeve);
        }
    }
}

async function writeDataToCache() {
    let s = JSON.stringify(sleeveCache);
    await ns.write(sleeveDataFile, s, "w");
}

function printHelp(){
    ns.tprint(`This script helps manage your sleeves.
USAGE: run ${ns.getScriptName()} [argument]
arguments:
--calculate-money : Display available augmentations and money required to purchase
--help      : print this help message
--purchase  : purchase all the augmentations we can with money available`);
}

/**
 * @param {SleeveSkills} sleeve
 * @param {string} crimeName
 * Calculate the chance a sleeve has of committing homicide successfully. */
function calculateCrimeChance(sleeve, crimeName) {
    const crimeStats = ns.getCrimeStats(crimeName);
    let chance =
        crimeStats.hacking_success_weight * sleeve['hacking'] +
        crimeStats.strength_success_weight * sleeve.strength +
        crimeStats.defense_success_weight * sleeve.defense +
        crimeStats.dexterity_success_weight * sleeve.dexterity +
        crimeStats.agility_success_weight * sleeve.agility +
        crimeStats.charisma_success_weight * sleeve.charisma;
    chance /= 975;
    chance /= crimeStats.difficulty;
    return Math.min(chance, 1);
}

function calculateOptimalStatsForCrime(crime){
    const crimeStats = ns.getCrimeStats(crime);
    let totalWeight = crimeStats.hacking_success_weight + crimeStats.strength_success_weight + crimeStats.defense_success_weight
        + crimeStats.dexterity_success_weight + crimeStats.agility_success_weight + crimeStats.charisma_success_weight;

    let totalExp = crimeStats.difficulty * 975;
    ns.tprint(`total = ${totalExp}`);
    if(crimeStats.hacking_success_weight > 0) {
        ns.tprintf(`hck: ${totalExp / crimeStats.hacking_success_weight}`)
    }
    ns.tprintf(`str: ${totalExp/crimeStats.strength_success_weight}`);
    ns.tprintf(`def: ${totalExp/crimeStats.defense_success_weight}`);
    ns.tprintf(`dex: ${totalExp/crimeStats.dexterity_success_weight}`);
    ns.tprintf(`agi: ${totalExp/crimeStats.agility_success_weight}`);
    ns.tprintf(`cha: ${totalExp/crimeStats.charisma_success_weight}`);
}

/**
 * Prints available sleeve details to log and terminal
 */
function printAllSleeveAugmentations(){
    let sleeveNum = ns.sleeve.getNumSleeves();
    let total = 0;
    for(let i = 0; i < sleeveNum; ++i){
        total += calculateMoneyRequiredForAugmentations(i, true);
        log(ns," ", true);
    }
    log(ns, `Total for all Sleeved = ${formatMoney(total)}`, true);
}

/**
 * Calculate the total augmentation bill for a sleeve with options to print to log and terminal
 * @param {number} sleeveNum - sleeve number
 * @param {boolean} doPrint - set to true to print info to log and terminal
 */
function calculateMoneyRequiredForAugmentations(sleeveNum, doPrint=false){
    let augmentations = ns.sleeve.getSleevePurchasableAugs(sleeveNum);
    let total = 0;
    log(ns, `${sleeveNames[sleeveNum]}'s available augmentations: `,true);
    log(ns, `==============================================`,true);
    for(let aug of augmentations){
        total += aug.cost;
        if(doPrint){
            log(ns, `\t${aug.name}\t\t${formatMoney(aug.cost)}`,true);
        }
    }
    if(augmentations.length===0 && doPrint){
        log(ns,"No augmentations are available for this sleeve.", true);
    }
    if(doPrint){
        log(ns,`==============================================`,true)
        log(ns,`${sleeveNames[sleeveNum]}'s Total: ${formatMoney(total)}`,true)
        log(ns,`==============================================`,true)
    }
    return total;
}

/**
 * Purchase available augmentations for a sleeve, as long as there is enough money
 * @param {number} sleeveNum - sleeve number
 * @param {boolean} doPrint - set to true to print info to log and terminal
 */
function purchaseAvailableAugmentations(sleeveNum, doPrint=false){
    let augmentations = ns.sleeve.getSleevePurchasableAugs(sleeveNum);
    augmentations.sort((a,b)=>{
        if(a.cost < b.cost)
            return -1;
        if(a.cost> b.cost)
            return 1;
        return 0;
    });
    let total = 0;
    for(let aug of augmentations){
        let myMoney = ns.getServerMoneyAvailable("home");
        if(myMoney > aug.cost){
            if(ns.sleeve.purchaseSleeveAug(sleeveNum, aug.name)){
                log(ns,`INFO: ${sleeveNames[sleeveNum]} purchased ${aug.name} for ${formatMoney(aug.cost)}`);
                total += aug.cost;
            } else {
                log(ns,`WARN: ${sleeveNames[sleeveNum]} failed to purchase ${aug.name} for ${formatMoney(aug.cost)}`);
            }
        } else {
            break;
        }
    }
    return total;
}

/*
    BE THE SLEEVE
    1) If not synchronized, synchronize. Do nothing until synchronized.

    2) If weak then train up.

    3) If we haven't started a gang yet then train up main until he is 100s then start committing homicides until we
       have a gang. We can't force main to do homicides, but we can start draining karma.

    3) Determine which factions need rep, and work them

    4) Find corporate jobs and work them until we join those factions. Then goto 3.

 */
function beTheSleeve(){

}
