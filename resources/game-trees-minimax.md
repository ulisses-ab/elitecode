# Game Trees & Minimax

## Game trees

A game tree is a tree where each node represents a game state and each edge represents a legal move that transitions from one state to another. The root is the current position. The children of any node are all positions reachable by one move. Leaf nodes are terminal states — checkmate, stalemate, draw, or any other position where the game is over.

The branching factor of the tree is the average number of legal moves available from any position. For chess it is roughly 35. The depth of the tree is the number of moves ahead you want to search. The total number of positions in the tree grows as branching_factor^depth, which is why searching even a few moves deep is computationally demanding.

## Minimax

In a two-player zero-sum game, one player's gain is the other's loss. Minimax exploits this structure: the maximising player picks the move that leads to the highest-scoring position; the minimising player picks the move that leads to the lowest-scoring position.

To find the best move at the root, you evaluate every leaf node with a static evaluation function, then propagate the scores back up the tree: maximising nodes take the maximum over their children's scores; minimising nodes take the minimum. The root then selects the move that leads to the best propagated score.

This produces the optimal play under the assumption that your opponent also plays optimally — which is the correct assumption in competitive settings.

## Static evaluation functions

The static evaluation function assigns a numeric score to a non-terminal position. It is called "static" because it does not recurse further — it estimates the value of the position based only on its current features.

For chess, a classical evaluation function considers:

- **Material balance** — the sum of piece values for each side. Standard values are pawn=1, knight=3, bishop=3, rook=5, queen=9.
- **Piece-square tables** — a bonus or penalty for each piece type based on the square it occupies. A knight is worth more in the centre than in the corner.
- **King safety** — the king should be tucked away and sheltered, especially in the middlegame.
- **Pawn structure** — doubled, isolated, and passed pawns all affect the long-term character of the position.
- **Mobility** — the number of legal moves available is a rough proxy for activity and flexibility.

The evaluation function is the most important design decision in a chess engine. All else being equal, a more accurate evaluation allows you to search to a shallower depth and still play well.

## Alpha-beta pruning

Alpha-beta pruning is an optimisation of minimax that eliminates branches that cannot possibly affect the final result.

The idea is to maintain two bounds during the search:
- **Alpha** — the best score the maximising player is guaranteed to achieve so far.
- **Beta** — the best score the minimising player is guaranteed to achieve so far.

If at any point the current node's score would fall outside the window [alpha, beta], you prune the remaining children — they will never be chosen by a rational opponent.

Alpha-beta pruning does not change the result of minimax, only the number of nodes evaluated. In the best case (when moves are ordered so the best move is always examined first), alpha-beta reduces the effective branching factor from b to approximately the square root of b, allowing you to search twice as deep in the same time.

Move ordering — examining likely-good moves first — is therefore crucial to getting the most out of alpha-beta.

## Iterative deepening

Rather than searching to a fixed depth, iterative deepening searches to depth 1, then depth 2, then depth 3, and so on, using the results of each pass to order moves for the next. This lets you use all available time while always having a best-move ready if you run out of time mid-search. Combined with a transposition table (a cache of previously evaluated positions), iterative deepening is the backbone of modern chess engines.
