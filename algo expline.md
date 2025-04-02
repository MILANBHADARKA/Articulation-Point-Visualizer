The `findArticulationPoints` function is designed to identify and highlight **articulation points** in an undirected graph using **Depth-First Search (DFS)**. Articulation points are vertices that, if removed, increase the number of connected components in the graph. Here's a detailed breakdown of the code:

---

### 1. **Resetting Previous State**
```javascript
nodes.forEach(node => node.articulationPoint = false);
clearArticulationPoints();
```
- The function starts by resetting any previously computed articulation points.
- `articulationPoint` is likely a property of each node that marks whether it's an articulation point.
- `clearArticulationPoints()` is a utility function to clear visual or data representations of past results.

---

### 2. **Handling an Empty Graph**
```javascript
if (nodes.length === 0) {
    document.getElementById("ap-list").textContent = "No nodes in the graph";
    showStatusMessage('No nodes to analyze');
    return;
}
```
- If there are no nodes in the graph, it updates the UI (`ap-list` element) and exits.

---

### 3. **Initialization**
```javascript
let visited = new Array(nodes.length).fill(false);
let disc = new Array(nodes.length).fill(-1);
let low = new Array(nodes.length).fill(-1);
let parent = new Array(nodes.length).fill(-1);
let articulationPoints = new Set();
let time = 0;
```
- **`visited`**: Tracks whether each node has been visited during the DFS traversal.
- **`disc`**: Stores the discovery time of each node during DFS.
- **`low`**: Tracks the lowest discovery time reachable from the subtree of a node.
- **`parent`**: Maintains the parent of each node in the DFS tree.
- **`articulationPoints`**: A set to store identified articulation points.
- **`time`**: A counter to maintain discovery time globally across recursive DFS calls.

---

### 4. **DFS Helper Function**
```javascript
function dfs(u) { ... }
```
The **`dfs`** function performs a depth-first traversal and identifies articulation points. Here's what it does:

#### a. **Mark the Current Node as Visited**
```javascript
visited[u] = true;
disc[u] = low[u] = ++time;
let children = 0;
```
- Marks the current node `u` as visited.
- Sets its discovery time (`disc[u]`) and initializes its `low[u]` value to the current time.
- Initializes `children` to count the number of children in the DFS tree.

---

#### b. **Explore Adjacent Nodes**
```javascript
for (let v of adjList[u]) { ... }
```
- For each neighbor `v` of `u`:
  - If `v` is unvisited, it is treated as a child of `u` in the DFS tree.
  - If `v` is already visited and isn't the parent of `u`, it indicates a back edge.

---

#### c. **Recursive DFS for Unvisited Neighbors**
```javascript
if (!visited[v]) {
    children++;
    parent[v] = u;
    dfs(v);
```
- Increments the number of children for node `u`.
- Sets the parent of `v` as `u`.
- Recursively explores `v`.

---

#### d. **Update `low[u]` After Recursion**
```javascript
low[u] = Math.min(low[u], low[v]);
```
- After returning from the DFS call for `v`, the `low[u]` value is updated to the minimum of its current `low[u]` and `low[v]`.

---

#### e. **Check Articulation Point Conditions**
1. **Root Node**
```javascript
if (parent[u] === -1 && children > 1) {
    articulationPoints.add(u);
}
```
- If `u` is the root of the DFS tree (i.e., `parent[u] === -1`) and has more than one child, it's an articulation point.

2. **Non-Root Node**
```javascript
if (parent[u] !== -1 && low[v] >= disc[u]) {
    articulationPoints.add(u);
}
```
- If `u` is not the root and the subtree rooted at `v` cannot reach an ancestor of `u`, then `u` is an articulation point.

---

#### f. **Handle Back Edges**
```javascript
else if (v !== parent[u]) {
    low[u] = Math.min(low[u], disc[v]);
}
```
- If `v` is already visited and isn't the parent of `u`, it updates `low[u]` to reflect the back edge.

---

### 5. **DFS for Each Connected Component**
```javascript
for (let i = 0; i < nodes.length; i++) {
    if (!visited[i]) {
        dfs(i);
    }
}
```
- Runs the `dfs` function for each connected component of the graph. This ensures all nodes are processed, even in disconnected graphs.

---

### 6. **Mark Articulation Points**
```javascript
articulationPoints.forEach(point => {
    nodes[point].articulationPoint = true;
});
```
- Updates each node's `articulationPoint` property to visually or programmatically highlight it.

---

### 7. **Display Results**
```javascript
displayArticulationPoints(articulationPoints);
drawGraph();
```
- Calls `displayArticulationPoints` to show the articulation points in the UI.
- Calls `drawGraph` to visually represent the graph and its articulation points.

---

### 8. **Show Status Message**
```javascript
if (articulationPoints.size > 0) {
    showStatusMessage(`Found ${articulationPoints.size} articulation point(s)`);
} else {
    showStatusMessage('No articulation points found');
}
```
- Displays a message indicating whether any articulation points were found.

---

### Summary
This function combines DFS logic with UI-related updates. It identifies articulation points by examining the graph's structure and updates the graph's visual representation and related UI elements accordingly. Let me know if you'd like further clarification or an example!
