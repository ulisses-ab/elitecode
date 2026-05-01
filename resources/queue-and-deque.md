# Queue & Deque Data Structures

## Queue

A queue is a First-In, First-Out (FIFO) data structure. Elements are added at the back and removed from the front, so the element that has been waiting the longest is always served next.

The three fundamental operations are enqueue (add to back), dequeue (remove from front), and peek (inspect the front without removing it). All three run in O(1) time with a linked-list or circular-array implementation.

Queues appear naturally whenever you need to process items in arrival order — BFS traversal, job scheduling, request buffers, and message passing between concurrent components are all queue-shaped problems.

## Deque

A deque (double-ended queue) generalises the queue by supporting O(1) insertion and removal at both ends. This makes it more flexible: it can act as a stack (last-in, first-out) by operating on one end, as a queue by operating on opposite ends, or as a sliding window by adding to the right and evicting from the left.

## Monotonic deque

A monotonic deque maintains its elements in sorted order by evicting from the appropriate end whenever a new element violates the ordering invariant. This lets you answer "what is the maximum (or minimum) in the current window?" in O(1) per step, because the front of the deque always holds the answer.

The eviction rule is the key: before enqueueing a new element, pop from the back any elements that are smaller (for a max-deque) or larger (for a min-deque) than the incoming element — they can never be the answer for any future window that includes the new element.

## Relationship to the call stack

A stack is a deque restricted to one end — Last-In, First-Out (LIFO). The call stack in every programming language is a stack: function frames are pushed on call and popped on return. Understanding this makes it easy to convert recursive algorithms to iterative ones by maintaining an explicit stack.

## Complexity summary

| Operation | Queue (linked list) | Deque |
|---|---|---|
| Push front | — | O(1) |
| Push back | O(1) | O(1) |
| Pop front | O(1) | O(1) |
| Pop back | — | O(1) |
| Peek | O(1) | O(1) |
