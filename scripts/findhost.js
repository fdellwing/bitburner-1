/** @type import(".").NS */
let ns = null;
let visited = [];
let path = [];
let findMePlease="";
/** @param {NS} _ns **/
export async function main(_ns) {
    ns = _ns;    
    if(ns.args.length<1){
        ns.tprint("hostname to find required as an argument!");
        return;
    } 
    findMePlease = ns.args[0].toLowerCase();
    ns.tprintf("finding %s", findMePlease);
    visited.push("home");
    path.push("home");
    if(findHost("home")){
        ns.tprint(path.join("->"));
    } else {
        ns.tprint("Not found!");
    }
    ns.exit();
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
        ns.printf("visiting %s", node)
        path.push(node);
        if(findHost(node)){
            return true;
        }  
        path.pop();
    }
    return false;
}