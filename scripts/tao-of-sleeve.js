/*
    Script: tao-of-sleeve.js
    Author: KodeMonkey
    Description:
        I don't understand sleeves, but I know I want to control them. This script controls my sleeves.
 */
import {log} from "./helpers";

/** @type import(".").NS */
let ns = null;
const argsSchema = [
    ["help", false],
    ['disable-training', false],    // Set to true to disable having sleeves workout at the gym (costs money)
    ['train-to-strength', 105],     // Sleeves will go to the gym until they reach this much Str
    ['train-to-defense', 105],      // Sleeves will go to the gym until they reach this much Def
    ['train-to-dexterity', 70],     // Sleeves will go to the gym until they reach this much Dex
    ['train-to-agility', 70],       // Sleeves will go to the gym until they reach this much Agi
]
/** @param {NS} _ns **/
export async function main(_ns) {
    ns = _ns;
    ns.disableLog("ALL");
    let options = ns.flags(argsSchema);
    if(options.help){
        printHelp();
        return;
    }

}

function printHelp(){
    ns.tprint(`This script helps manage your sleeves.
USAGE: run ${ns.getScriptName()} [argument]
arguments:
--help      : print this help message`);
}