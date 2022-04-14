/**
 * Script: contract-auto-solver.js
 * 
 * Description:
 *  A script that automatically scans all servers for contracts and attempts
 *  to solve them. There are solutions for the following contract types:
 *          
 *      Algorithmic Stock Trader I
 *      Algorithmic Stock Trader II
 *      Algorithmic Stock Trader III
 *      Algorithmic Stock Trader IV
 *      Array Jumping Game
 *      Array Jumping Game II
 *      Find All Valid Math Expressions
 *      Find Largest Prime Factor
 *      Generate IP Addresses
 *      HammingCodes: Encoded Binary to Integer
 *      HammingCodes: Integer to encoded Binary
 *      Merge Overlapping Intervals
 *      Minimum Path Sum in a Triangle
 *      Sanitize Parentheses in Expression
 *      Spiralize Matrix
 *      Subarray with Maximum Sum
 *      Total Ways to Sum
 *      Total Ways to Sum II
 *      Unique Paths in a Grid I
 *      Unique Paths in a Grid II
 * 
 * Args: None
 * 
 * @param {import(".").NS} ns - The nestcript instance passed to main entry point
 */
export function main(ns) {
    ns.disableLog("ALL")
    const contracts = getAllServers(ns).flatMap((server) => {
        const onServer = ns.ls(server, ".cct").map((contract) => {
            const type = ns.codingcontract.getContractType(contract, server);
            const data = ns.codingcontract.getData(contract, server);
            const didSolve = solve(type, data, server, contract, ns);
            const result = didSolve ? "COMPLETE!" : "FAILED!";
            return `${server} - ${contract} - ${type} - ${result}`;
        });
        return onServer;
    });
    ns.tprint(`Found ${contracts.length} contracts`);
    contracts.forEach((contract) => void ns.tprint(contract));
}

// return list of all servers, not belonging to player
function getAllServers(ns) {
    let pendingScan = ["home"]
    const list = new Set(pendingScan)
    while (pendingScan.length) {
        const hostname = pendingScan.shift()
        if (!ns.getServer(hostname).purchasedByPlayer) {
            list.add(hostname)
        }
        pendingScan.push(...ns.scan(hostname))
        pendingScan = pendingScan.filter(host => !list.has(host))
    }
    return [...list]
}

function solve(type, data, server, contract, ns) {
    let solution = "";
    switch (type) {
        case "Algorithmic Stock Trader I":
            solution = maxProfit([1, data]);
            break;
        case "Algorithmic Stock Trader II":
            solution = maxProfit([Math.ceil(data.length / 2), data]);
            break;
        case "Algorithmic Stock Trader III":
            solution = maxProfit([2, data]);
            break;
        case "Algorithmic Stock Trader IV":
            solution = maxProfit(data);
            break;
        case "Minimum Path Sum in a Triangle":
            solution = solveTriangleSum(data, ns);
            break;
        case "Unique Paths in a Grid I":
            solution = uniquePathsI(data);
            break;
        case "Unique Paths in a Grid II":
            solution = uniquePathsII(data);
            break;
        case "Generate IP Addresses":
            solution = generateIps(data);
            break;
        case "Find Largest Prime Factor":
            solution = factor(data);
            break;
        case "Spiralize Matrix":
            solution = spiral(data);
            break;
        case "Merge Overlapping Intervals":
            solution = mergeOverlap(data);
            break;
        case "Find All Valid Math Expressions":
            solution = findAllValidMathExpressions(data);
            break;
        case "Array Jumping Game":
            solution = solveArrayJumpingGame(data, 0);
            break;
        case "Array Jumping Game II":
            solution = solveArrayJumpingGameII(data);
            break;
        case "Subarray with Maximum Sum":
            solution = subarrayMaxSum(data);
            break;
        case "Sanitize Parentheses in Expression":
            solution = sanitizeParentheses(data);
            break;
        case "Total Ways to Sum":
            solution = totalWaysToSum(data);
            break;
        case "Total Ways to Sum II":
            solution = totalWaysToSumII(data);
            break;
        case "HammingCodes: Encoded Binary to Integer":
            solution = solveHammingDecodeContract(data);
            break;
        case "HammingCodes: Integer to encoded Binary":
            solution = HammingEncode(data);
            break;
        default:
            ns.tprintf("ERROR: Contract type '%s' has no solving function.", type);
            solution = "$FUCKMEINTHEGOATASS!"
            break;
    }
    return ("$FUCKMEINTHEGOATASS!" != solution) ? ns.codingcontract.attempt(solution, contract, server, [true]) : false;
}

//ALGORITHMIC STOCK TRADER

function maxProfit(arrayData) {
    let i, j, k;

    let maxTrades = arrayData[0];
    let stockPrices = arrayData[1];

    let tempStr = "[0";
    for (i = 0; i < stockPrices.length; i++) {
        tempStr += ",0";
    }
    tempStr += "]";
    let tempArr = "[" + tempStr;
    for (i = 0; i < maxTrades - 1; i++) {
        tempArr += "," + tempStr;
    }
    tempArr += "]";

    let highestProfit = JSON.parse(tempArr);

    for (i = 0; i < maxTrades; i++) {
        for (j = 0; j < stockPrices.length; j++) { // Buy / Start
            for (k = j; k < stockPrices.length; k++) { // Sell / End
                if (i > 0 && j > 0 && k > 0) {
                    highestProfit[i][k] = Math.max(highestProfit[i][k], highestProfit[i - 1][k], highestProfit[i][k - 1], highestProfit[i - 1][j - 1] + stockPrices[k] - stockPrices[j]);
                } else if (i > 0 && j > 0) {
                    highestProfit[i][k] = Math.max(highestProfit[i][k], highestProfit[i - 1][k], highestProfit[i - 1][j - 1] + stockPrices[k] - stockPrices[j]);
                } else if (i > 0 && k > 0) {
                    highestProfit[i][k] = Math.max(highestProfit[i][k], highestProfit[i - 1][k], highestProfit[i][k - 1], stockPrices[k] - stockPrices[j]);
                } else if (j > 0 && k > 0) {
                    highestProfit[i][k] = Math.max(highestProfit[i][k], highestProfit[i][k - 1], stockPrices[k] - stockPrices[j]);
                } else {
                    highestProfit[i][k] = Math.max(highestProfit[i][k], stockPrices[k] - stockPrices[j]);
                }
            }
        }
    }
    return highestProfit[maxTrades - 1][stockPrices.length - 1];
}

//SMALLEST TRIANGLE SUM

function solveTriangleSum(arrayData, ns) {
    let triangle = arrayData;
    let nextArray;
    let previousArray = triangle[0];

    for (let i = 1; i < triangle.length; i++) {
        nextArray = [];
        for (let j = 0; j < triangle[i].length; j++) {
            if (j == 0) {
                nextArray.push(previousArray[j] + triangle[i][j]);
            } else if (j == triangle[i].length - 1) {
                nextArray.push(previousArray[j - 1] + triangle[i][j]);
            } else {
                nextArray.push(Math.min(previousArray[j], previousArray[j - 1]) + triangle[i][j]);
            }

        }

        previousArray = nextArray;
    }

    return Math.min.apply(null, nextArray);
}

//UNIQUE PATHS IN A GRID

function uniquePathsI(grid) {
    const rightMoves = grid[0] - 1;
    const downMoves = grid[1] - 1;

    return Math.round(factorialDivision(rightMoves + downMoves, rightMoves) / (factorial(downMoves)));
}

function factorial(n) {
    return factorialDivision(n, 1);
}

function factorialDivision(n, d) {
    if (n == 0 || n == 1 || n == d)
        return 1;
    return factorialDivision(n - 1, d) * n;
}

function uniquePathsII(grid) {
    if (grid[0][0]) return 0
    let m = grid.length, n = grid[0].length
    let dp = Array.from({ length: m }, el => new Uint32Array(n))
    dp[0][0] = 1
    for (let i = 0; i < m; i++)
        for (let j = 0; j < n; j++)
            if (grid[i][j] || (!i && !j)) continue
            else dp[i][j] = (i ? dp[i - 1][j] : 0) + (j ? dp[i][j - 1] : 0)
    return dp[m - 1][n - 1]
}

//GENERATE IP ADDRESSES

function generateIps(num) {
    num = num.toString();

    const length = num.length;

    const ips = [];

    for (let i = 1; i < length - 2; i++) {
        for (let j = i + 1; j < length - 1; j++) {
            for (let k = j + 1; k < length; k++) {
                const ip = [
                    num.slice(0, i),
                    num.slice(i, j),
                    num.slice(j, k),
                    num.slice(k, num.length)
                ];
                let isValid = true;

                ip.forEach(seg => {
                    isValid = isValid && isValidIpSegment(seg);
                });

                if (isValid) ips.push(ip.join("."));
            }
        }
    }

    return ips;

}

function isValidIpSegment(segment) {
    if (segment[0] == "0" && segment != "0") return false;
    segment = Number(segment);
    if (segment < 0 || segment > 255) return false;
    return true;
}

//GREATEST FACTOR

function factor(num) {
    for (let div = 2; div <= Math.sqrt(num); div++) {
        if (num % div != 0) {
            continue;
        }
        num = num / div;
        div = 1;
    }
    return num;
}

//SPIRALIZE Matrix

function spiral(arr, accum = []) {
    if (arr.length === 0 || arr[0].length === 0) {
        return accum;
    }
    accum = accum.concat(arr.shift());
    if (arr.length === 0 || arr[0].length === 0) {
        return accum;
    }
    accum = accum.concat(column(arr, arr[0].length - 1));
    if (arr.length === 0 || arr[0].length === 0) {
        return accum;
    }
    accum = accum.concat(arr.pop().reverse());
    if (arr.length === 0 || arr[0].length === 0) {
        return accum;
    }
    accum = accum.concat(column(arr, 0).reverse());
    if (arr.length === 0 || arr[0].length === 0) {
        return accum;
    }
    return spiral(arr, accum);
}

function column(arr, index) {
    const res = [];
    for (let i = 0; i < arr.length; i++) {
        const elm = arr[i].splice(index, 1)[0];
        if (elm) {
            res.push(elm);
        }
    }
    return res;
}

// Merge Overlapping Intervals

function mergeOverlap(intervals) {
    intervals.sort(([minA], [minB]) => minA - minB);
    for (let i = 0; i < intervals.length; i++) {
        for (let j = i + 1; j < intervals.length; j++) {
            const [min, max] = intervals[i];
            const [laterMin, laterMax] = intervals[j];
            if (laterMin <= max) {
                const newMax = laterMax > max ? laterMax : max;
                const newInterval = [min, newMax];
                intervals[i] = newInterval;
                intervals.splice(j, 1);
                j = i;
            }
        }
    }
    return intervals;
}

// Find All Valid Math Expressions

function findAllValidMathExpressions(data) {
    let input = data[0];
    let target = data[1];
    let res = [];
    getExprUtil(res, "", input, target, 0, 0, 0);
    return res;
}
function getExprUtil(res, curExp, input, target, pos, curVal, last) {
    // true if whole input is processed with some
    // operators
    if (pos == input.length) {
        // if current value is equal to target
        //then only add to final solution
        // if question is : all possible o/p then just
        //push_back without condition
        if (curVal == target)
            res.push(curExp);
        return;
    }

    // loop to put operator at all positions
    for (let i = pos; i < input.length; i++) {
        // ignoring case which start with 0 as they
        // are useless for evaluation
        if (i != pos && input[pos] == '0')
            break;

        // take part of input from pos to i
        let part = input.substr(pos, i + 1 - pos);

        // take numeric value of part
        let cur = parseInt(part, 10);

        // if pos is 0 then just send numeric value
        // for next recursion
        if (pos == 0)
            getExprUtil(res, curExp + part, input,
                target, i + 1, cur, cur);


        // try all given binary operator for evaluation
        else {
            getExprUtil(res, curExp + "+" + part, input,
                target, i + 1, curVal + cur, cur);
            getExprUtil(res, curExp + "-" + part, input,
                target, i + 1, curVal - cur, -cur);
            getExprUtil(res, curExp + "*" + part, input,
                target, i + 1, curVal - last + last * cur,
                last * cur);
        }
    }
}

// Array Jumping Game
function solveArrayJumpingGame(a, i) {
    var l = a.length;
    if (l == 0) return 0; // empty array, WTF?
    if (i >= l) return 0; // past end of array
    if (i == l - 1) {
        return 1; // The end has been reached.    

    }
    var k = a[i];
    for (let j = 1; j <= k; ++j) {
        if (solveArrayJumpingGame(a, i + j)) {
            return 1;
        }
    }
    return 0;
}


function solveArrayJumpingGameII(a, i = 0, jumpCount = 0) {
    // A slightly different take on the problem, but the solution is similar
    let l = a.length;
    if (l == 0) return 0; // empty array, WTF?
    if (i >= l) return 0; // past end of array
    if (i == l - 1) {
        return jumpCount; // The end has been reached.    
    }
    let minJumpCount = 0;
    let k = a[i];
    for (let j = 1; j <= k; ++j) {
        var jc = solveArrayJumpingGameII(a, i + j, jumpCount + 1);
        if (jc > 0 && (minJumpCount == 0 || jc < minJumpCount)) {
            minJumpCount = jc;
        }
    }
    return minJumpCount;
}

// Subarray with Maximum Sum

function subarrayMaxSum(a) {
    if (a.length == 0) {
        return 0;
    }
    var l = a.length;
    var maxSum = a[0]; // start with the first value in the array as the max sum
    for (let i = 0; i < l; i++) {
        var c = a[i];
        if (c > maxSum) {
            maxSum = c;
        }
        for (let j = i + 1; j < l; j++) {
            c += a[j];
            if (c > maxSum) {
                maxSum = c;
            }
        }
    }
    return maxSum;
}

// Sanitize Parentheses in Expression

function isParenthesis(c) {
    return ((c == '(') || (c == ')'));
}

function isValidString(str) {
    let cnt = 0;
    for (let i = 0; i < str.length; i++) {
        if (str[i] == '(')
            cnt++;
        else if (str[i] == ')')
            cnt--;
        if (cnt < 0)
            return false;
    }
    return (cnt == 0);
}

function sanitizeParentheses(str) {
    var res = [];
    if (str.length == 0)
        return res;

    let visit = new Set();

    let q = [];
    let temp;
    let level = false;

    q.push(str);
    visit.add(str);
    while (q.length != 0) {
        str = q.shift();
        if (isValidString(str)) {
            res.push(str)
            level = true;
        }
        if (level)
            continue;
        for (let i = 0; i < str.length; i++) {
            if (!isParenthesis(str[i]))
                continue;

            temp = str.substring(0, i) + str.substring(i + 1);
            if (!visit.has(temp)) {
                q.push(temp);
                visit.add(temp);
            }
        }
    }
    return res;
}

// Total Ways to Sum

function totalWaysToSum(data) {
    let k = data;

    let dp = Array.from({ length: data + 1 }, (_, i) => 0);
    dp[0] = 1;

    for (let row = 1; row < k + 1; row++) {
        for (let col = 1; col < data + 1; col++) {
            if (col >= row) {
                dp[col] = dp[col] + dp[col - row];
            }
        }
    }
    return (dp[data] - 1);
}

function totalWaysToSumII(data){
    const n = data[0];
    const s = data[1];
    const ways = [1];
    ways.length = n + 1;
    ways.fill(0, 1);
    for (let i = 0; i < s.length; i++) {
      for (let j = s[i]; j <= n; j++) {
        ways[j] += ways[j - s[i]];
      }
    }
    return ways[n];
}

// HammingCodes

function HammingEncode(value) {
    function HammingSumOfParity(lengthOfDBits) {
        return lengthOfDBits < 3 || lengthOfDBits == 0
            ? lengthOfDBits == 0
                ? 0
                : lengthOfDBits + 1
            :
            Math.ceil(Math.log2(lengthOfDBits * 2)) <=
                Math.ceil(Math.log2(1 + lengthOfDBits + Math.ceil(Math.log2(lengthOfDBits))))
                ? Math.ceil(Math.log2(lengthOfDBits) + 1)
                : Math.ceil(Math.log2(lengthOfDBits));
    }
    const data = parseInt(value).toString(2).split("");
    const sumParity = HammingSumOfParity(data.length);
    const count = (arr, val) => arr.reduce((a, v) => (v === val ? a + 1 : a), 0);
    const build = ["x", "x", ...data.splice(0, 1)];
    for (let i = 2; i < sumParity; i++) {
        build.push("x", ...data.splice(0, Math.pow(2, i) - 1));
    }
    for (const index of build.reduce(function (a, e, i) {
        if (e == "x")
            a.push(i);
        return a;
    }, [])) {

        const tempcount = index + 1;
        const temparray = [];
        const tempdata = [...build];
        while (tempdata[index] !== undefined) {
            const temp = tempdata.splice(index, tempcount * 2);
            temparray.push(...temp.splice(0, tempcount));
        }
        temparray.splice(0, 1);
        build[index] = (count(temparray, "1") % 2).toString();
    }
    build.unshift((count(build, "1") % 2).toString());
    return build.join("");
}

function HammingDecode(data) {
    const build = data.split("");
    const testArray = [];
    const sumParity = Math.ceil(Math.log2(data.length));
    const count = (arr, val) => arr.reduce((a, v) => (v === val ? a + 1 : a), 0);
    let overallParity = build.splice(0, 1).join("");
    testArray.push(overallParity == (count(build, "1") % 2).toString() ? true : false);
    for (let i = 0; i < sumParity; i++) {
        const tempIndex = Math.pow(2, i) - 1;
        const tempStep = tempIndex + 1;
        const tempData = [...build];
        const tempArray = [];
        while (tempData[tempIndex] != undefined) {
            const temp = [...tempData.splice(tempIndex, tempStep * 2)];
            tempArray.push(...temp.splice(0, tempStep));
        }
        const tempParity = tempArray.shift();
        testArray.push(tempParity == (count(tempArray, "1") % 2).toString() ? true : false);
    }
    let fixIndex = 0;
    for (let i = 1; i < sumParity + 1; i++) {
        fixIndex += testArray[i] ? 0 : Math.pow(2, i) / 2;
    }
    build.unshift(overallParity);
    if (fixIndex > 0 && testArray[0] == false) {
        build[fixIndex] = build[fixIndex] == "0" ? "1" : "0";
    }
    else if (testArray[0] == false) {
        overallParity = overallParity == "0" ? "1" : "0";
    }
    else if (testArray[0] == true && testArray.some((truth) => truth == false)) {
        return 0;
    }
    for (let i = sumParity; i >= 0; i--) {
        build.splice(Math.pow(2, i), 1);
    }
    build.splice(0, 1);
    return parseInt(build.join(""), 2);
}

function solveHammingDecodeContract(data) {
    return `${HammingDecode(data)}`;
}