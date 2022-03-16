/** @type import(".").NS */
let ns = null;
var visited = [];
var path = [];
var findMePlease;
/** @param {NS} _ns **/
export async function main(_ns) {
    ns = _ns;    
    if(ns.args.length<1){
        ns.tprint("hostname to find required as an argument!");
        return;
    } 
    findMePlease = ns.args[0];
    visited.push("home");
    path.push("home");
    if(findHost("home")){
        ns.tprint(path.join("->"));
    } else {
        ns.tprint("Not found!");
    }
}

function findHost(hostname){
    // scan for neigbors
    if(hostname.toLowerCase()==findMePlease.toLowerCase()){
        return true; //found what we are looking for!
    }
    var nodes = ns.scan(hostname); 
    for (let node of nodes) {
        
        if(visited.includes(node)){
            continue; // already been here
        }
        visited.push(node);
        path.push(node);
        if(findHost(node)){
            return true;
        }  
        path.pop();
    }
    return false;
}