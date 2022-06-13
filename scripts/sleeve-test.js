import { log, formatMoney } from "./helpers";
/** @type import(".").NS */
let ns = null;
const avoidedSleeveAugmentations = ["QLink", "Hydroflame Left Arm"];
// These are the names I gave my sleeves, only for IO purposes
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

/** @param {NS} _ns **/
export async function main(_ns) {
    ns = _ns;    
    calculateMoneyRequiredForAugmentations(3,true);
    log(ns,`array includes ${avoidedSleeveAugmentations.includes("QLink")}`, true);
}


/**
 * Calculate the total augmentation bill for a sleeve with options to print to log and terminal
 * @param {number} sleeveNum - sleeve number
 * @param {boolean} doPrint - set to true to print info to log and terminal
 */
 function calculateMoneyRequiredForAugmentations(sleeveNum, doPrint=false){
    let augmentations = ns.sleeve.getSleevePurchasableAugs(sleeveNum);
    let total = 0;
    if(doPrint){
        log(ns, `${sleeveNames[sleeveNum]}'s available augmentations: `,true);
        log(ns, `==============================================`,true);
    }
    for(let aug of augmentations){
        if(!avoidedSleeveAugmentations.includes(aug.name)){
            total += aug.cost;
            if(doPrint){
                log(ns, `\t${aug.name}\t\t${formatMoney(aug.cost)}`,true);
            }    
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