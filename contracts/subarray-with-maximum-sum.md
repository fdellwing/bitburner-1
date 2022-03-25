# Subarray with Maximum Sum
You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.


Given the following integer array, find the contiguous subarray (containing at least one number) which has the largest sum and return that sum. 'Sum' refers to the sum of all the numbers in the subarray.
-1,-5,-3,-8,8,-7,-8,8,-10,6,2,3,-8,-2,8,-9,-2,-6,2,-9,9,3,2,-7,1,-10,-6,2,-5,-3,-10,8,6,8,3

```
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
```
