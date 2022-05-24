
# Proper 2-Coloring of a Graph

You are given the following data, representing a graph:

`[9,[[1,3],[1,5],[2,7],[2,6],[4,7],[2,5],[0,4],[2,4]]]`

Note that "graph", as used here, refers to the field of graph theory, and has no relation to statistics or plotting. The first element of the data represents the number of vertices in the graph. Each vertex is a unique number between 0 and 8. The next element of the data represents the edges of the graph. Two vertices u,v in a graph are said to be adjacent if there exists an edge [u,v]. Note that an edge [u,v] is the same as an edge [v,u], as order does not matter. You must construct a 2-coloring of the graph, meaning that you have to assign each vertex in the graph a "color", either 0 or 1, such that no two adjacent vertices have the same color. Submit your answer in the form of an array, where element i represents the color of vertex i. If it is impossible to construct a 2-coloring of the given graph, instead submit an empty array.

Examples:

```
Input: [4, [[0, 2], [0, 3], [1, 2], [1, 3]]]
Output: [0, 0, 1, 1]

Input: [3, [[0, 1], [0, 2], [1, 2]]]
Output: []
```

# Solution

This is well known problem in computer science, usually stated as the k-coloring problem where
k is the number of colors to color the graph of n vertices. So 2 color is just a subset of the k-coloring 
problem. Our max n is 8, so we don't even have to come up with an efficient solution. Polynomial time
is fine.

1) Create an adjacency matrix from data
2) Assign v1 color 0
3) BFS through graph, at each node assign next vertex the opposite color.
4) If you ever find an instance where the next already has the same color as node return empty array

```
function proper2ColoringOfAGraph(data) {
    // k = 2
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
                return []; // invalid graph
            }
        }
    }
    return colors;
}

let answer = proper2ColoringOfAGraph([4, [[0, 2], [0, 3], [1, 2], [1, 3]]]);
for (let i = 0; i < answer.length; i++) {
    console.log(answer[i].toString());
}
```

