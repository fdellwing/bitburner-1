/** @type import("..").NS */
let ns = null;

/** @param {NS} _ns **/
export async function main(_ns) {
    ns = _ns;
    ns.tprintf("%d", solveArrayJumpingGame([2, 6, 8, 3, 4, 5, 7, 4, 7, 1, 4, 8], 0));
    ns.tprintf("%d", solveArrayJumpingGame([0, 6, 8, 3, 4, 5, 7, 4, 7, 1, 4, 8], 0));
    ns.tprintf("%d", solveArrayJumpingGame([2, 6, 8, 0, 0, 0, 0, 4, 0, 0, 0, 8], 0));
    ns.tprintf("%d", solveArrayJumpingGame([2, 6, 8, 0, 0, 0, 0, 0, 0, 0, 0, 8], 0));
}

function solveArrayJumpingGame(a, i) {
    var l = a.length;
    if (l == 0) return 0; // empty array, WTF?
    if (i >= l) return 0; // past end of array
    if (i == l - 1){
        //ns.tprintf("a[%d] = %d", i, a[i])
        return 1; // The end has been reached.    
        
    }    
    var k = a[i];
    for (let j = 1; j <= k; ++j) {
        if (solveArrayJumpingGame(a, i + j)) {
            //ns.tprintf("a[%d] = %d; j = %d", i, a[i], j)
            return 1;
        }
    }
    return 0;
}