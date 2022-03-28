export async function main(ns) {
    const data = ns.flags([
        ["target", ""],
        ["stock", false],
        ["sleep", 10000]
    ]);
    if (data.target == "") {
        ns.print("No target provided, exiting now.")
        return;
    }
    while (true) {
        await ns.hack(data.target, { stock: data.stock });
        await ns.sleep(data.sleep);
    }
}