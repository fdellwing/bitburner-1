export async function main(ns) {
    const data = ns.flags([
        ["target", ""],
        ["stock", false],
        ["sleep", 1000]
    ]);
    if (data.target == "") {
        ns.print("No target provided, exiting now.")
        return;
    }
    while (true) {
        await ns.grow(data.target, { stock: data.stock });
        await ns.sleep(data.sleep);
    }
}