# Trees & Tries

## Trees

A tree is a hierarchical data structure made up of nodes connected by edges, where every node except the root has exactly one parent. Trees are acyclic by definition — there are no cycles in the parent-child relationships.

Key terminology:

- **Root** — the single top-level node with no parent.
- **Leaf** — a node with no children.
- **Internal node** — any non-leaf node.
- **Depth** — the number of edges from the root to a node.
- **Height** — the number of edges on the longest path from a node to a leaf.
- **N-ary tree** — a tree where each node may have up to N children.

### File systems as trees

A hierarchical file system is a natural tree. Directories are internal nodes and files are leaves. The root is the top-level directory. Every file has a unique absolute path, which is just the sequence of node names from root to leaf — a path through the tree.

Operations like "find all files matching a pattern" or "calculate total size of a directory" are tree traversals. Because each node is visited once, they run in O(n) time proportional to the number of nodes.

### Tree traversal orders

**Pre-order** visits a node before visiting its children. Useful for serialising a tree or computing properties that depend on ancestors (e.g. absolute paths from relative names).

**Post-order** visits a node after all its children have been visited. Useful for computing properties that depend on descendants (e.g. subtree size, disk usage).

**Level-order** (BFS) visits all nodes at depth d before visiting nodes at depth d+1. Useful when you care about the nearest match or minimum depth.

---

## Tries (Prefix Trees)

A trie is a tree that stores strings by distributing their characters across the tree's edges. Every path from the root to a marked node spells out a stored string. Nodes at the same depth share the same prefix.

This structure makes prefix operations extremely efficient. Checking whether any stored string starts with a given prefix takes O(m) time where m is the prefix length, regardless of how many strings are stored.

### Why tries work for routing

A URL router must match an incoming path like `/api/users/42/posts` against a set of registered route patterns. A trie indexed by path segments (splitting on `/`) reduces each lookup to a sequence of child-pointer dereferences — one per segment. This is O(depth) regardless of the total number of routes, which is much better than scanning every pattern linearly.

Wildcards (`:userId`, `*`) are handled by adding special child types that match any segment.

### Complexity

| Operation | Time |
|---|---|
| Insert a string of length m | O(m) |
| Lookup a string of length m | O(m) |
| Find all strings with prefix p | O(p + results) |

Space is O(total characters stored), with sharing across common prefixes.
