# Total Ways to Sum
You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.


It is possible write four as a sum in exactly four different ways:
```
    3 + 1
    2 + 2
    2 + 1 + 1
    1 + 1 + 1 + 1
```
How many different ways can the number 92 be written as a sum of at least two positive integers?

```
function totalWaysToSum(N) {
    let K = N;

    let dp = Array.from({ length: N + 1 }, (_, i) => 0);
    dp[0] = 1;

    for (let row = 1; row < K + 1; row++) {
        for (let col = 1; col < N + 1; col++) {
            if (col >= row) {
                dp[col] = dp[col] + dp[col - row];
            }
        }
    }
    return (dp[N] - 1);
}
```
