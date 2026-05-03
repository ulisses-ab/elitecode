#define _POSIX_C_SOURCE 200809L
#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include "VFS.h"

/* ---- Node ---- */

typedef struct Node {
    char name[256];
    int  is_dir;
    char *content;
    struct Node **children;
    int   nchildren, cap_children;
    struct Node *parent;
} Node;

struct VFS { Node *root; };

static Node *node_new(const char *name, int is_dir, Node *parent) {
    Node *n = calloc(1, sizeof(*n));
    strncpy(n->name, name, 255);
    n->is_dir = is_dir;
    n->parent = parent;
    if (is_dir) { n->cap_children = 4; n->children = malloc(4 * sizeof(Node *)); }
    return n;
}

static void node_free(Node *n) {
    if (!n) return;
    if (n->is_dir)
        for (int i = 0; i < n->nchildren; i++) node_free(n->children[i]);
    free(n->children);
    free(n->content);
    free(n);
}

static Node *node_deep_copy(Node *n, Node *parent) {
    Node *copy = calloc(1, sizeof(*copy));
    *copy = *n;
    copy->parent = parent;
    copy->content = n->content ? strdup(n->content) : NULL;
    if (n->is_dir) {
        copy->children = malloc(n->cap_children * sizeof(Node *));
        for (int i = 0; i < n->nchildren; i++)
            copy->children[i] = node_deep_copy(n->children[i], copy);
    } else {
        copy->children = NULL;
    }
    return copy;
}

static void dir_add(Node *dir, Node *child) {
    if (dir->nchildren == dir->cap_children) {
        dir->cap_children *= 2;
        dir->children = realloc(dir->children, dir->cap_children * sizeof(Node *));
    }
    dir->children[dir->nchildren++] = child;
}

static void dir_remove(Node *dir, Node *child) {
    for (int i = 0; i < dir->nchildren; i++) {
        if (dir->children[i] == child) {
            dir->children[i] = dir->children[--dir->nchildren];
            return;
        }
    }
}

static Node *dir_find_child(Node *dir, const char *name) {
    for (int i = 0; i < dir->nchildren; i++)
        if (strcmp(dir->children[i]->name, name) == 0) return dir->children[i];
    return NULL;
}

/* ---- Path resolution ---- */

/* Resolve path, optionally stopping one component before the end.
   Returns the node (or parent node if stop_at_parent), or NULL on error.
   On success, sets *leaf_name to the last component (if stop_at_parent). */
static Node *resolve(Node *root, const char *path, int stop_at_parent,
                     char *leaf_name, char **err) {
    if (path[0] != '/') { if (err) *err = "not found"; return NULL; }

    char tmp[4096];
    strncpy(tmp, path, 4095);

    /* Split into components */
    char *comps[256]; int nc = 0;
    char *tok = strtok(tmp + 1, "/");
    while (tok && nc < 255) { comps[nc++] = tok; tok = strtok(NULL, "/"); }

    Node *cur = root;
    int limit = stop_at_parent ? nc - 1 : nc;

    for (int i = 0; i < limit; i++) {
        if (!cur->is_dir) { if (err) *err = "not a directory"; return NULL; }
        Node *child = dir_find_child(cur, comps[i]);
        if (!child) { if (err) *err = "not found"; return NULL; }
        cur = child;
    }

    if (stop_at_parent && nc > 0 && leaf_name)
        strncpy(leaf_name, comps[nc - 1], 255);
    else if (stop_at_parent && nc == 0)
        cur = root; /* path was "/" */

    return cur;
}

/* ---- VFS ---- */

VFS *vfs_create(void) {
    VFS *v = malloc(sizeof(*v));
    v->root = node_new("", 1, NULL);
    return v;
}

char *vfs_mkdir(VFS *v, const char *path) {
    char leaf[256]; char *err = NULL;
    Node *parent = resolve(v->root, path, 1, leaf, &err);
    if (!parent) { char *r = malloc(64); sprintf(r, "ERROR: %s\n", err); return r; }
    if (!parent->is_dir) { return strdup("ERROR: not a directory\n"); }
    if (dir_find_child(parent, leaf)) return strdup("ERROR: already exists\n");
    dir_add(parent, node_new(leaf, 1, parent));
    return NULL;
}

char *vfs_touch(VFS *v, const char *path) {
    char leaf[256]; char *err = NULL;
    Node *parent = resolve(v->root, path, 1, leaf, &err);
    if (!parent) { char *r = malloc(64); sprintf(r, "ERROR: %s\n", err); return r; }
    if (!parent->is_dir) return strdup("ERROR: not a directory\n");
    if (dir_find_child(parent, leaf)) return strdup("ERROR: already exists\n");
    dir_add(parent, node_new(leaf, 0, parent));
    return NULL;
}

char *vfs_write(VFS *v, const char *path, const char *content) {
    char leaf[256]; char *err = NULL;
    Node *parent = resolve(v->root, path, 1, leaf, &err);
    if (!parent) { char *r = malloc(64); sprintf(r, "ERROR: %s\n", err); return r; }
    if (!parent->is_dir) return strdup("ERROR: not a directory\n");
    Node *node = dir_find_child(parent, leaf);
    if (!node) {
        node = node_new(leaf, 0, parent);
        dir_add(parent, node);
    } else if (node->is_dir) {
        return strdup("ERROR: is a directory\n");
    }
    free(node->content);
    node->content = strdup(content);
    return NULL;
}

char *vfs_read(VFS *v, const char *path) {
    char *err = NULL;
    Node *node = resolve(v->root, path, 0, NULL, &err);
    if (!node) { char *r = malloc(64); sprintf(r, "ERROR: %s\n", err); return r; }
    if (node->is_dir) return strdup("ERROR: is a directory\n");
    size_t len = node->content ? strlen(node->content) : 0;
    char *r = malloc(len + 2);
    if (len) memcpy(r, node->content, len);
    r[len] = '\n'; r[len+1] = '\0';
    return r;
}

static int cmp_names(const void *a, const void *b) {
    return strcmp((*(Node **)a)->name, (*(Node **)b)->name);
}

char *vfs_ls(VFS *v, const char *path) {
    char *err = NULL;
    Node *node = resolve(v->root, path, 0, NULL, &err);
    if (!node) { char *r = malloc(64); sprintf(r, "ERROR: %s\n", err); return r; }
    if (!node->is_dir) return strdup("ERROR: not a directory\n");
    if (node->nchildren == 0) return strdup("");

    /* sort children */
    Node **sorted = malloc(node->nchildren * sizeof(Node *));
    memcpy(sorted, node->children, node->nchildren * sizeof(Node *));
    qsort(sorted, node->nchildren, sizeof(Node *), cmp_names);

    size_t total = 0;
    for (int i = 0; i < node->nchildren; i++)
        total += strlen(sorted[i]->name) + 2; /* name + optional "/" + "\n" */
    char *r = malloc(total + 1); char *p = r;
    for (int i = 0; i < node->nchildren; i++) {
        p += sprintf(p, "%s%s\n", sorted[i]->name, sorted[i]->is_dir ? "/" : "");
    }
    free(sorted);
    return r;
}

char *vfs_rm(VFS *v, const char *path) {
    char leaf[256]; char *err = NULL;
    Node *parent = resolve(v->root, path, 1, leaf, &err);
    if (!parent) { char *r = malloc(64); sprintf(r, "ERROR: %s\n", err); return r; }
    Node *node = dir_find_child(parent, leaf);
    if (!node) return strdup("ERROR: not found\n");
    if (node->is_dir && node->nchildren > 0) return strdup("ERROR: not empty\n");
    dir_remove(parent, node);
    node_free(node);
    return NULL;
}

char *vfs_rmr(VFS *v, const char *path) {
    char leaf[256]; char *err = NULL;
    Node *parent = resolve(v->root, path, 1, leaf, &err);
    if (!parent) { char *r = malloc(64); sprintf(r, "ERROR: %s\n", err); return r; }
    Node *node = dir_find_child(parent, leaf);
    if (!node) return strdup("ERROR: not found\n");
    dir_remove(parent, node);
    node_free(node);
    return NULL;
}

char *vfs_mv(VFS *v, const char *src, const char *dst) {
    char src_leaf[256], dst_leaf[256]; char *err = NULL;
    Node *src_parent = resolve(v->root, src, 1, src_leaf, &err);
    if (!src_parent) { char *r = malloc(64); sprintf(r, "ERROR: %s\n", err); return r; }
    Node *node = dir_find_child(src_parent, src_leaf);
    if (!node) return strdup("ERROR: not found\n");

    Node *dst_parent = resolve(v->root, dst, 1, dst_leaf, &err);
    if (!dst_parent) { char *r = malloc(64); sprintf(r, "ERROR: %s\n", err); return r; }
    if (!dst_parent->is_dir) return strdup("ERROR: not a directory\n");
    if (dir_find_child(dst_parent, dst_leaf)) return strdup("ERROR: already exists\n");

    dir_remove(src_parent, node);
    strncpy(node->name, dst_leaf, 255);
    node->parent = dst_parent;
    dir_add(dst_parent, node);
    return NULL;
}

char *vfs_cp(VFS *v, const char *src, const char *dst) {
    char src_leaf[256], dst_leaf[256]; char *err = NULL;
    Node *src_parent = resolve(v->root, src, 1, src_leaf, &err);
    if (!src_parent) { char *r = malloc(64); sprintf(r, "ERROR: %s\n", err); return r; }
    Node *node = dir_find_child(src_parent, src_leaf);
    if (!node) return strdup("ERROR: not found\n");

    Node *dst_parent = resolve(v->root, dst, 1, dst_leaf, &err);
    if (!dst_parent) { char *r = malloc(64); sprintf(r, "ERROR: %s\n", err); return r; }
    if (!dst_parent->is_dir) return strdup("ERROR: not a directory\n");
    if (dir_find_child(dst_parent, dst_leaf)) return strdup("ERROR: already exists\n");

    Node *copy = node_deep_copy(node, dst_parent);
    strncpy(copy->name, dst_leaf, 255);
    dir_add(dst_parent, copy);
    return NULL;
}

static void find_recursive(Node *n, const char *name, const char *cur_path,
                            char **buf, size_t *len, size_t *cap) {
    for (int i = 0; i < n->nchildren; i++) {
        Node *child = n->children[i];
        char path[4096];
        snprintf(path, sizeof(path), "%s/%s", cur_path, child->name);

        if (strcmp(child->name, name) == 0) {
            size_t pl = strlen(path) + 2;
            if (*len + pl > *cap) { *cap = (*cap + pl) * 2; *buf = realloc(*buf, *cap); }
            *len += sprintf(*buf + *len, "%s\n", path);
        }
        if (child->is_dir) find_recursive(child, name, path, buf, len, cap);
    }
}

static int cmp_str(const void *a, const void *b) {
    return strcmp(*(const char **)a, *(const char **)b);
}

char *vfs_find(VFS *v, const char *path, const char *name) {
    char *err = NULL;
    Node *start = resolve(v->root, path, 0, NULL, &err);
    if (!start) { char *r = malloc(64); sprintf(r, "ERROR: %s\n", err); return r; }
    if (!start->is_dir) return strdup("ERROR: not a directory\n");

    size_t cap = 4096, len = 0;
    char *buf = malloc(cap);
    buf[0] = '\0';

    /* Compute base path (strip trailing slash for root) */
    char base[4096];
    if (strcmp(path, "/") == 0) base[0] = '\0'; else strncpy(base, path, 4095);

    find_recursive(start, name, base, &buf, &len, &cap);

    /* Sort lines */
    if (len == 0) return buf;
    int nlines = 0;
    for (size_t i = 0; i < len; i++) if (buf[i] == '\n') nlines++;
    char **lines = malloc(nlines * sizeof(char *));
    char *p = buf, *q;
    for (int i = 0; i < nlines; i++) {
        q = strchr(p, '\n'); *q = '\0';
        lines[i] = strdup(p); p = q + 1;
    }
    qsort(lines, nlines, sizeof(char *), cmp_str);
    char *out = malloc(len + 1); size_t olen = 0;
    for (int i = 0; i < nlines; i++) {
        olen += sprintf(out + olen, "%s\n", lines[i]);
        free(lines[i]);
    }
    free(lines); free(buf);
    return out;
}

void vfs_destroy(VFS *v) { node_free(v->root); free(v); }
