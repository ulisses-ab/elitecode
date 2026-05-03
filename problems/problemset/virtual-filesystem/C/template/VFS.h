#ifndef VFS_H
#define VFS_H

/* Each function returns a malloc'd string to append to the output, or NULL for
   silent success. On error, return a malloc'd "ERROR: <reason>\n" string.
   The caller (testbench) frees the returned pointer. */

typedef struct VFS VFS;

VFS  *vfs_create(void);
char *vfs_mkdir(VFS *v, const char *path);
char *vfs_touch(VFS *v, const char *path);
char *vfs_write(VFS *v, const char *path, const char *content);
char *vfs_read(VFS *v, const char *path);
char *vfs_ls(VFS *v, const char *path);
char *vfs_rm(VFS *v, const char *path);   /* non-recursive */
char *vfs_rmr(VFS *v, const char *path);  /* recursive */
char *vfs_mv(VFS *v, const char *src, const char *dst);
char *vfs_cp(VFS *v, const char *src, const char *dst);
char *vfs_find(VFS *v, const char *path, const char *name);
void  vfs_destroy(VFS *v);

#endif
