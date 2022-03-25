# Array Jumping Game
You are attempting to solve a Coding Contract. You have 1 tries remaining, after which the contract will self-destruct.


You are given the following array of integers:

```2,6,8,3,4,5,7,4,7,1,4,8```

Each element in the array represents your MAXIMUM jump length at that position. This means that if you are at position i and your maximum jump length is n, you can jump to any position from i to i+n.

Assuming you are initially positioned at the start of the array, determine whether you are able to reach the last index.

Your answer should be submitted as 1 or 0, representing true and false respectively

```
/** @type import(".").NS */
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
```