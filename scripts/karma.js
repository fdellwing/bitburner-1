/*
    karma.js
    Author: KodeMonkey

    Description: 
    This program will display the players current karma value in the hud. When the
    program exits it will clean up after itself. 
*/
/** @type import(".").NS */
let ns = null;
const elementId = "karma-display-1";
const baseId = "karma-display-";

/** @param {NS} _ns **/
export async function main(_ns) {
    ns = _ns;    
    let hudElement = initializeHud();
    ns.atExit(() => hudElement.parentElement.parentElement.parentElement.removeChild(hudElement.parentElement.parentElement));
    while(true){
        let karma = ns.heart.break();
        ns.printf("Karma: %d", karma);   
        hudElement.innerText = `${karma} `;        
        await ns.sleep(3000);
    }
}

function initializeHud() {
    const d = eval("document");
    let htmlDisplay = d.getElementById(elementId);
    if (htmlDisplay !== null) return htmlDisplay;
    // Get the custom display elements in HUD.
    let customElements = d.getElementById("overview-extra-hook-0").parentElement.parentElement;
    // Make a clone of the hook for extra hud elements, and move it up under money
    let karmaValueTracker = customElements.cloneNode(true);
    // Remove any nested elements created by stats.js
    karmaValueTracker.querySelectorAll("p > p").forEach(el => el.parentElement.removeChild(el));
    // Change ids since duplicate id's are invalid
    karmaValueTracker.querySelectorAll("p").forEach((el, i) => el.id = baseId + i);
    // Get out output element
    htmlDisplay = karmaValueTracker.querySelector("#karma-display-1");
    // Display label and default value
    karmaValueTracker.querySelectorAll("p")[0].innerText = "Karma";
    htmlDisplay.innerText = "0"
    // Insert our element right after Money
    customElements.parentElement.insertBefore(karmaValueTracker, customElements.parentElement.childNodes[2]);
    return htmlDisplay;
}