#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include "VFS.h"

struct VFS {
    /* add your fields here */
};

VFS *vfs_create(void) {
    VFS *v = malloc(sizeof(*v));
    return v;
}

char *vfs_mkdir(VFS *v, const char *path) {
    /* TODO */
    (void)v; (void)path;
    return NULL;
}

char *vfs_touch(VFS *v, const char *path) {
    /* TODO */
    (void)v; (void)path;
    return NULL;
}

char *vfs_write(VFS *v, const char *path, const char *content) {
    /* TODO */
    (void)v; (void)path; (void)content;
    return NULL;
}

char *vfs_read(VFS *v, const char *path) {
    /* TODO */
    (void)v; (void)path;
    return NULL;
}

char *vfs_ls(VFS *v, const char *path) {
    /* TODO */
    (void)v; (void)path;
    return NULL;
}

char *vfs_rm(VFS *v, const char *path) {
    /* TODO */
    (void)v; (void)path;
    return NULL;
}

char *vfs_rmr(VFS *v, const char *path) {
    /* TODO */
    (void)v; (void)path;
    return NULL;
}

char *vfs_mv(VFS *v, const char *src, const char *dst) {
    /* TODO */
    (void)v; (void)src; (void)dst;
    return NULL;
}

char *vfs_cp(VFS *v, const char *src, const char *dst) {
    /* TODO */
    (void)v; (void)src; (void)dst;
    return NULL;
}

char *vfs_find(VFS *v, const char *path, const char *name) {
    /* TODO */
    (void)v; (void)path; (void)name;
    return NULL;
}

void vfs_destroy(VFS *v) {
    free(v);
}
