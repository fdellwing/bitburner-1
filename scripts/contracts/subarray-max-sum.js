/** @type import(".").NS */
let ns = null;

/** @param {NS} _ns **/
export async function main(_ns) {
    ns = _ns;    
    ns.tprintf("%d", subarrayMaxSum([-1,-5,-3,-8,8,-7,-8,8,-10,6,2,3,-8,-2,8,-9,-2,-6,2,-9,9,3,2,-7,1,-10,-6,2,-5,-3,-10,8,6,8,3]));
}

function subarrayMaxSum(a){
    if(a.length == 0){
        return 0;
    }
    var l = a.length;
    var maxSum = a[0]; // start with the first value in the array as the max sum
    for(let i = 0; i < l; i++){
        var c = a[i];
        if(c > maxSum){
            maxSum = c;
        }
        for(let j = i + 1; j < l; j++){
            c += a[j];
            if(c > maxSum){
                maxSum = c;
            }    
        }
    }
    return maxSum;
}