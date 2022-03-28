/** @type import(".").NS */
let ns = null;
let visited = [];
let path = [];
let findMePlease = "";
/** @param {NS} _ns **/
export async function main(_ns) {
    ns = _ns;
    if (ns.args.length < 1) {
        ns.tprint("hostname to find required as an argument!");
        return;
    }
    findMePlease = ns.args[0].toLowerCase();
    visited = []; path = [];
    ns.tprintf("finding %s", findMePlease);
    visited.push("home");
    path.push("home");    
    if (findHost("home")) {
        ns.tprint(path.join("->"));
    } else {
        ns.tprint("Not found!");
    }
    ns.exit();
}

function findHost(hostname) {
    // scan for neigbors
    if (hostname.toLowerCase() == findMePlease.toLowerCase()) {
        return true; //found what we are looking for!
    }
    let nodes = ns.scan(hostname);    
    for(let i = 0; i < nodes.length; ++i) {
        let node = nodes[i];
        if (visited.includes(node)) {
            continue; // already been here
        }
        visited.push(node);
        path.push(node);
        if (findHost(node)) {
            return true;
        }
        path.pop();
    }
    return false;
}

