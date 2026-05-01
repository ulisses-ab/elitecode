# Sliding Window Technique

A sliding window is a contiguous subrange that moves through a larger sequence. Instead of reprocessing the entire range on every step, you maintain a running result and update it incrementally as the window advances — adding whatever enters the front and removing whatever falls out the back.

## Fixed-size windows

When the window size is constant, each step is a simple exchange: subtract the element leaving the left edge and add the element entering the right edge. This turns what would be an O(n·k) scan into a single O(n) pass.

The pattern appears in problems like maximum sum subarray of size k, average of every k consecutive elements, and any query that asks about a fixed-width slice of a sequence.

## Variable-size windows

When the window can grow or shrink, you expand the right boundary to explore and contract the left boundary to restore a violated invariant. The key insight is that each element is added once and removed at most once, so the total work remains linear even though the window size changes dynamically.

This variant solves problems like longest substring without repeating characters, smallest subarray with sum ≥ target, and minimum window substring.

## Time-based windows

In systems problems, the window is defined by a time range rather than an element count — for example, "at most N requests in the last 60 seconds." The structure is the same: maintain a queue of timestamps, evict entries older than the window boundary on every operation, and check whether the remaining count satisfies the limit.

Because entries are added to one end and removed from the other, a double-ended queue is the natural backing data structure. Each timestamp is enqueued once and dequeued once, giving O(1) amortised cost per operation.

## Why it works

The core insight behind every sliding window is that you are exploiting monotonicity — either the window size is fixed, or moving the left boundary can only make things worse in one direction (shrink the count, reduce the sum, etc.). This lets you reason about the window with a two-pointer approach instead of exhaustive search.

## Complexity

Fixed-size windows run in O(n) time and O(1) extra space. Variable-size windows also run in O(n) time but may require O(k) space for the auxiliary structure tracking what is currently in the window. Time-based windows use O(limit) space bounded by the maximum number of entries that can be inside the window simultaneously.
