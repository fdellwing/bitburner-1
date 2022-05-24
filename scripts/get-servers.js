// Returns an unsorted list of all servers
/** @param {import(".").NS} ns*/
export function getAllServers(ns, rootHost = 'home', includePersonal = false) {
    ns.disableLog('scan')
    let pendingScan = [rootHost]
    const list = new Set(pendingScan)

    while (pendingScan.length) {
        const hostname = pendingScan.shift()
        if (includePersonal || !ns.getServer(hostname).purchasedByPlayer) {
            list.add(hostname)
        }

        pendingScan.push(...ns.scan(hostname))
        pendingScan = pendingScan.filter(host => !list.has(host))
    }

    return [...list]
}

/** @param {import(".").NS} ns*/
export function getPurchasedServers(ns){
    ns.disableLog('scan')
    return ns.scan("home").filter(server => ns.getServer(server).purchasedByPlayer && ns.getServer(server).hostname.startsWith("p"));
}