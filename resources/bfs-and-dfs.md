# BFS & DFS

Graph search algorithms answer the question "which nodes are reachable from a starting node, and how?" The two fundamental strategies — breadth-first search (BFS) and depth-first search (DFS) — differ in the order they visit nodes, and this difference makes each one naturally suited to different problems.

## Depth-First Search (DFS)

DFS explores as far as possible along a branch before backtracking. It descends into a neighbour immediately, then descends into that node's neighbours, and so on, until it reaches a node with no unvisited neighbours — at which point it backtracks and tries the next option.

The implicit data structure is the call stack: a recursive DFS uses the system's call stack, while an iterative DFS maintains an explicit stack. Either way, the currently active path from the start node to the current node is what's stored on the stack.

DFS is the natural choice when you need to:

- Detect cycles in a graph.
- Compute a topological ordering of a DAG.
- Find any path (not necessarily the shortest) between two nodes.
- Enumerate all paths or solutions via backtracking.
- Traverse a tree in pre-order or post-order.
- Explore a file system recursively.

The space complexity of DFS is O(h), where h is the maximum depth of the search. For trees this is the height; for general graphs it depends on the structure. DFS can use much less memory than BFS when the graph is wide but not deep.

## Breadth-First Search (BFS)

BFS explores all nodes at the current depth before moving to the next depth level. It fans out layer by layer from the starting node. The data structure is a queue — nodes are added to the back as they are discovered and removed from the front as they are visited.

The crucial property of BFS is that it visits nodes in order of their distance from the start. The first time BFS reaches any node, it has found the shortest path (in terms of number of edges) from the start to that node. This makes BFS the correct algorithm for shortest-path queries in unweighted graphs.

BFS is the natural choice when you need to:

- Find the shortest path in an unweighted graph.
- Find all nodes within a given number of hops.
- Compute the minimum number of moves to reach a goal state.
- Traverse a tree level-by-level.

The space complexity of BFS is O(w), where w is the maximum width of the graph at any level. In the worst case (e.g. a star graph) this can be O(n), which makes BFS more memory-intensive than DFS.

## Comparison

| Property | DFS | BFS |
|---|---|---|
| Data structure | Stack (implicit or explicit) | Queue |
| Finds shortest path? | No (in general) | Yes (unweighted) |
| Memory | O(height) | O(width) |
| Detects cycles? | Yes | Yes |
| Natural for trees? | Pre/post-order traversal | Level-order traversal |

## Marking visited nodes

Both algorithms require tracking which nodes have already been visited to avoid revisiting them and looping infinitely in cyclic graphs. The standard approach is a hash set that is checked before each new visit. In grids and other structured graphs, a boolean array is often more efficient.

## Connection to file systems

Traversing a directory tree is DFS — you fully explore each subdirectory before moving to the next. The recursive structure of the file system (each directory contains files and more directories) maps directly onto DFS's recursive descent. A "find all files matching a pattern" operation is nothing more than a DFS over the tree that collects matching leaf nodes.
