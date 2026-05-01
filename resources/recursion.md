# Recursion & The Call Stack

## What recursion is

A function is recursive when it calls itself as part of its own definition. Every recursive solution consists of two parts: a base case that produces a result directly without further recursion, and a recursive case that reduces the problem to a smaller version of itself and combines the results.

The key question when designing a recursive solution is: if I already had the answer for a smaller input, how would I construct the answer for the current input?

## The call stack

Each function call creates a stack frame that holds the function's local variables, parameters, and the address to return to when the function finishes. These frames are stored on the call stack — a LIFO structure managed automatically by the runtime.

When a recursive function calls itself, a new frame is pushed onto the stack. When it returns, the frame is popped and control returns to the caller. Deep recursion therefore uses O(depth) stack space, which is why very deep recursion risks a stack overflow.

## Recursion and tree structures

Tree-shaped problems are where recursion shines most clearly. A tree is naturally recursive — each subtree is itself a tree of the same kind. This means a function that works on a tree almost always has the form: handle the base case (null or leaf), recursively process the children, then combine the results.

File system traversal, expression evaluation, and game tree search all have this structure. The recursive call mirrors the tree's structure exactly, which makes the code direct and easy to reason about.

## Converting recursion to iteration

Any recursive algorithm can be rewritten iteratively by maintaining an explicit stack. You push what would have been a recursive call's arguments onto the stack, then pop and process them in a loop. This gives you control over memory usage and avoids stack-overflow limits, at the cost of more verbose code.

The reverse is also true: iterative algorithms that use an explicit stack can often be expressed more cleanly as recursion.

## Memoisation

When the same subproblem appears multiple times in the recursion tree, recomputing it is wasteful. Memoisation stores the result of each subproblem the first time it is computed and returns the cached result on subsequent calls. This transforms exponential recursion into polynomial time for problems with overlapping subproblems — a technique that underpins dynamic programming.

## Tail calls

A tail call is a recursive call that is the very last operation in the function — the caller does nothing with the result except return it. Some languages optimise tail calls by reusing the current stack frame instead of creating a new one, turning what would be O(n) stack usage into O(1). Python does not perform this optimisation, so deep tail-recursive functions still need to be converted to iteration.

## Common pitfalls

- Forgetting the base case, causing infinite recursion.
- A base case that is correct but not reached for some inputs.
- Modifying shared state inside the recursion without properly undoing it (backtracking requires careful cleanup).
- Assuming the call stack is unlimited — in practice it is a few thousand to a few tens of thousands of frames deep.
