#include <stdlib.h>
#include <string.h>
#include "Chess.h"

struct Chess {
    /* add your board representation and state here */
};

Chess *chess_create(void) {
    Chess *g = malloc(sizeof(*g));
    return g;
}

void chess_new_game(Chess *g) {
    /* TODO: set up the initial board position, white to move */
    (void)g;
}

char *chess_move(Chess *g, const char *uci) {
    /* TODO */
    (void)g; (void)uci;
    return strdup("ILLEGAL");
}

char *chess_print(const Chess *g) {
    /* TODO: return 8 lines of 8 chars each, ending with '\n' */
    (void)g;
    return strdup("........\n........\n........\n........\n........\n........\n........\n........\n");
}

char *chess_moves(Chess *g, const char *sq) {
    /* TODO */
    (void)g; (void)sq;
    return strdup("");
}

char *chess_status(Chess *g) {
    /* TODO */
    (void)g;
    return strdup("WHITE_TO_MOVE");
}

char *chess_history(Chess *g) {
    /* TODO */
    (void)g;
    return strdup("");
}

void chess_destroy(Chess *g) {
    free(g);
}
