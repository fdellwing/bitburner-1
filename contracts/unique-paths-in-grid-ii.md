# Unique Paths in a Grid II
You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.


You are located in the top-left corner of the following grid:
```
0,0,0,0,0,
0,0,0,0,0,
1,1,0,1,0,
0,0,1,0,0,
0,0,0,0,1,
0,0,0,0,0,
0,0,0,1,1,
0,0,0,0,0,
0,0,0,0,1,
0,0,0,1,0,
0,1,0,0,0,
0,0,0,0,0,
```
You are trying reach the bottom-right corner of the grid, but you can only move down or right on each step. Furthermore, there are obstacles on the grid that you cannot move onto. These obstacles are denoted by '1', while empty spaces are denoted by 0.

Determine how many unique paths there are from start to finish.

NOTE: The data returned for this contract is an 2D array of numbers representing the grid.

```
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
```