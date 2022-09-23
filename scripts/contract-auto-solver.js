
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
 *      Compression I: RLE Compression
 *      Compression II: LZ Decompression
 *      Compression III: LZ Compression
 *      Find All Valid Math Expressions
 *      Find Largest Prime Factor
 *      Generate IP Addresses
 *      HammingCodes: Encoded Binary to Integer
 *      HammingCodes: Integer to encoded Binary
 *      HammingCodes: Integer to Encoded Binary
 *      Merge Overlapping Intervals
 *      Minimum Path Sum in a Triangle
 *      Proper 2-Coloring of a Graph
 *      Sanitize Parentheses in Expression
 *      Spiralize Matrix
 *      Subarray with Maximum Sum
 *      Shortest Path in a Grid
 *      Total Ways to Sum
 *      Total Ways to Sum II
 *      Unique Paths in a Grid I
 *      Unique Paths in a Grid II
 *      Encryption I: Caesar Cipher
 *      Encryption II: Vigenère Cipher
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
            const logType = didSolve ? "SUCCESS:" : "WARN:";
            return `${logType} ${server} - ${contract} - ${type} - ${result}`;
        });
        return onServer;
    });
    ns.tprint(`INFO: Found ${contracts.length} contracts`);
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
            // left this here in case someone is still running the old version
            solution = HammingEncode(data);
            break;
        case "HammingCodes: Integer to Encoded Binary":
            solution = HammingEncode(data);
            break;
        case "Shortest Path in a Grid":
            solution = shortestPathInGrid(data);
            break;
        case "Proper 2-Coloring of a Graph":
            solution = proper2ColoringOfAGraph(data);
            break;
        case "Compression III: LZ Compression":
            solution = compressionIII(data);
            break;
        case "Compression II: LZ Decompression":
            solution = decompressII(data);
            break;
        case "Compression I: RLE Compression":
            solution = rleCompress(data);
            break;
        case "Encryption I: Caesar Cipher":
            solution = caesarCipher(data);
            break;
        case "Encryption II: Vigenère Cipher":
            solution = vigenereCipher(data);
            break;
        default:
            ns.tprintf("ERROR: Contract type '%s' has no solving function.", type);
            solution = "$FUCKMEINTHEGOATASS!"
            break;
    }
    return ("$FUCKMEINTHEGOATASS!" !== solution) ? ns.codingcontract.attempt(solution, contract, server, [true]) : false;
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

function totalWaysToSumII(data) {
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

// Shortest Path in Grid
// https://www.redblobgames.com/pathfinding/a-star/introduction.html

/** Binary heap. */
class BinHeap {
    constructor() {
        this.data = [];
    }
    get size() {
        return this.data.length;
    }
    push(value, weight) {
        const i = this.data.length;
        this.data[i] = [weight, value];
        this.heapifyUp(i);
    }
    peek() {
        if (this.data.length == 0)
            return undefined;
        return this.data[0][1];
    }
    pop() {
        if (this.data.length == 0)
            return undefined;
        const value = this.data[0][1];
        this.data[0] = this.data[this.data.length - 1];
        this.data.length = this.data.length - 1;
        this.heapifyDown(0);
        return value;
    }
    changeWeight(predicate, weight) {
        const i = this.data.findIndex((e) => predicate(e[1]));
        if (i == -1)
            return;
        this.data[i][0] = weight;
        const p = Math.floor((i - 1) / 2);
        if (!this.heapOrderABeforeB(this.data[p][0], this.data[i][0]))
            this.heapifyUp(i);
        else
            this.heapifyDown(i);
    }
    heapifyUp(i) {
        while (i > 0) {
            const p = Math.floor((i - 1) / 2);
            if (this.heapOrderABeforeB(this.data[p][0], this.data[i][0]))
                break;
            const tmp = this.data[p];
            this.data[p] = this.data[i];
            this.data[i] = tmp;
            i = p;
        }
    }
    heapifyDown(i) {
        while (i < this.data.length) {
            const l = i * 2 + 1;
            const r = i * 2 + 2;
            let toSwap = i;
            if (l < this.data.length && this.heapOrderABeforeB(this.data[l][0], this.data[toSwap][0]))
                toSwap = l;
            if (r < this.data.length && this.heapOrderABeforeB(this.data[r][0], this.data[toSwap][0]))
                toSwap = r;
            if (i == toSwap)
                break;
            const tmp = this.data[toSwap];
            this.data[toSwap] = this.data[i];
            this.data[i] = tmp;
            i = toSwap;
        }
    }
}
class MinHeap extends BinHeap {
    heapOrderABeforeB(weightA, weightB) {
        return weightA < weightB;
    }
}
class PathStep {
    constructor(fy, fx, ty, tx) {
        this.fromY = fy;
        this.fromX = fx;
        this.toY = ty;
        this.toX = tx;
    }
    toString() {
        if (this.fromY < this.toY) {
            return "D";
        }
        if (this.fromY > this.toY) {
            return "U";
        }
        if (this.fromX < this.toX) {
            return "R";
        }
        if (this.fromX > this.toX) {
            return "L";
        }
        return "";
    }
}
function shortestPathInGrid(data) {
    const width = data[0].length;
    const height = data.length;
    const dstY = height - 1;
    const dstX = width - 1;
    const distance = new Array(height);
    const queue = new MinHeap();
    const cameFrom = new Map();
    for (let y = 0; y < height; y++) {
        distance[y] = new Array(width).fill(Infinity);
    }
    function validPosition(y, x) {
        return y >= 0 && y < height && x >= 0 && x < width && data[y][x] == 0;
    }
    function* neighbors(y, x) {
        if (validPosition(y - 1, x))
            yield [y - 1, x]; // Up
        if (validPosition(y + 1, x))
            yield [y + 1, x]; // Down
        if (validPosition(y, x - 1))
            yield [y, x - 1]; // Left
        if (validPosition(y, x + 1))
            yield [y, x + 1]; // Right
    }
    distance[0][0] = 0;
    queue.push([0, 0], 0);
    while (queue.size > 0) {
        const [y, x] = queue.pop();
        for (const [yN, xN] of neighbors(y, x)) {
            const d = distance[y][x] + 1;
            if (d < distance[yN][xN]) {
                if (distance[yN][xN] == Infinity)
                    queue.push([yN, xN], d);
                else
                    queue.changeWeight(([yQ, xQ]) => yQ == yN && xQ == xN, d);
                distance[yN][xN] = d;
                cameFrom.set(`${yN},${xN}`, [y, x]);
            }
        }
    }
    if (distance[dstY][dstX] == Infinity)
        return "";
    const thePath = new Array();
    let current = [dstY, dstX];
    while (!(current[0] == 0 && current[1] == 0)) {
        let from = cameFrom.get(`${current[0]},${current[1]}`);
        thePath.unshift(new PathStep(from[0], from[1], current[0], current[1]));
        current = from;
    }
    return thePath.map(p => p.toString()).join("");
}

// Proper 2-Coloring of a Graph

function proper2ColoringOfAGraph(data) {
    let n = data[0];    // number of vertices
    let a = data[1];    // adjacency data

    // create an adjacency matrix for the BFS
    let adjacencyMatrix = [];
    for (let i = 0; i < n; i++) {
        adjacencyMatrix.push(new Array(n).fill(0));
    }
    for (let edge of a) {
        let v1 = edge[0];
        let v2 = edge[1];
        adjacencyMatrix[v1][v2] = 1;
        adjacencyMatrix[v2][v1] = 1;
    }

    // create response array, set v1 to color 0
    let colors = new Array(n).fill(-1);
    colors[0] = 0;

    // BFS through the graph and assign colors
    let queue = [];
    queue.push(0);

    while (queue.length > 0) {
        let next = queue.shift();
        let color1 = colors[next];
        let color2 = color1 ^ 1;
        let adjacency = adjacencyMatrix[next];
        for (let v = 0; v < n; v++) {
            if (adjacency[v] !== 1) continue;
            if (colors[v] === -1) {
                colors[v] = color2;
                queue.push(v);
            } else if (colors[v] === color1) {
                return "[]"; // invalid graph, why string?
            }
        }
    }
    return colors;
}

// Compression III

function compressionIII(data) {
    let cur_state = Array.from(Array(10), () => Array(10).fill(null));
    let new_state = Array.from(Array(10), () => Array(10));
    function set(state, i, j, str) {
        const current = state[i][j];
        if (current == null || str.length < current.length) {
            state[i][j] = str;
        }
        else if (str.length === current.length && Math.random() < 0.5) {
            state[i][j] = str;
        }
    }

    cur_state[0][1] = "";
    for (let i = 1; i < data.length; ++i) {
        for (const row of new_state) {
            row.fill(null);
        }
        const c = data[i];
        for (let length = 1; length <= 9; ++length) {
            const string = cur_state[0][length];
            if (string == null) {
                continue;
            }
            if (length < 9) {
                set(new_state, 0, length + 1, string);
            }
            else {
                set(new_state, 0, 1, string + "9" + data.substring(i - 9, i) + "0");
            }
            for (let offset = 1; offset <= Math.min(9, i); ++offset) {
                if (data[i - offset] === c) {
                    set(new_state, offset, 1, string + length + data.substring(i - length, i));
                }
            }
        }

        for (let offset = 1; offset <= 9; ++offset) {
            for (let length = 1; length <= 9; ++length) {
                const string = cur_state[offset][length];
                if (string == null) {
                    continue;
                }
                if (data[i - offset] === c) {
                    if (length < 9) {
                        set(new_state, offset, length + 1, string);
                    }
                    else {
                        set(new_state, offset, 1, string + "9" + offset + "0");
                    }
                }

                set(new_state, 0, 1, string + length + offset);
                for (let new_offset = 1; new_offset <= Math.min(9, i); ++new_offset) {
                    if (data[i - new_offset] === c) {
                        set(new_state, new_offset, 1, string + length + offset + "0");
                    }
                }
            }
        }
        const tmp_state = new_state;
        new_state = cur_state;
        cur_state = tmp_state;
    }
    let result = null;
    for (let len = 1; len <= 9; ++len) {
        let string = cur_state[0][len];
        if (string == null) {
            continue;
        }
        string += len + data.substring(data.length - len, data.length);
        if (result == null || string.length < result.length) {
            result = string;
        }
        else if (string.length === result.length && Math.random() < 0.5) {
            result = string;
        }
    }
    for (let offset = 1; offset <= 9; ++offset) {
        for (let len = 1; len <= 9; ++len) {
            let string = cur_state[offset][len];
            if (string == null) {
                continue;
            }
            string += len + "" + offset;
            if (result == null || string.length < result.length) {
                result = string;
            }
            else if (string.length === result.length && Math.random() < 0.5) {
                result = string;
            }
        }
    }
    return result !== null && result !== void 0 ? result : "";
}

//Compression II: LZ Decompression

function decompressII(data) {
    let plain = "";
    for (let i = 0; i < data.length;) {
        const literal_length = data.charCodeAt(i) - 0x30;
        if (literal_length < 0 || literal_length > 9 || i + 1 + literal_length > data.length) {
            return null;
        }
        plain += data.substring(i + 1, i + 1 + literal_length);
        i += 1 + literal_length;
        if (i >= data.length) {
            break;
        }
        const backref_length = data.charCodeAt(i) - 0x30;
        if (backref_length < 0 || backref_length > 9) {
            return null;
        }
        else if (backref_length === 0) {
            ++i;
        }
        else {
            if (i + 1 >= data.length) {
                return null;
            }
            const backref_offset = data.charCodeAt(i + 1) - 0x30;
            if ((backref_length > 0 && (backref_offset < 1 || backref_offset > 9)) || backref_offset > plain.length) {
                return null;
            }
            for (let j = 0; j < backref_length; ++j) {
                plain += plain[plain.length - backref_offset];
            }
            i += 2;
        }
    }
    return plain;
}

// Compression I: RLE Compression

function rleCompress(data) {
    let response = "";
    if (data === "") {
        return response;
    }

    let currentRun = "";
    let runLength = 0;

    function addEncodedRun(char, length) {
        while (length > 0) {
            if (length >= 9) {
                response += `9${char}`;
            } else {
                response += `${length}${char}`
            }
            length -= 9;
        }
    }

    for (let c of data) {
        if (currentRun === "") {
            currentRun = c;
            runLength = 1;
        } else if (currentRun === c) {
            runLength++;
        } else if (currentRun !== c) {
            addEncodedRun(currentRun, runLength);
            currentRun = c;
            runLength = 1;
        }
    }
    addEncodedRun(currentRun, runLength);
    return response;
}

// Encryption I: Caesar Cipher

function caesarCipher(data) {
    const cipher = [...data[0]]
        .map((a) => (a === " " ? a : String.fromCharCode(((a.charCodeAt(0) - 65 - data[1] + 26) % 26) + 65)))
        .join("");
    return cipher;
}

// Encryption II: Vigenère Cipher

function vigenereCipher(data) {
    const cipher = [...data[0]]
        .map((a, i) => {
            return a === " "
                ? a
                : String.fromCharCode(((a.charCodeAt(0) - 2 * 65 + data[1].charCodeAt(i % data[1].length)) % 26) + 65);
        })
        .join("");
    return cipher;
}
