#define _POSIX_C_SOURCE 200809L
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <sys/resource.h>
#include "../code/VFS.h"

static long peak_kb(void){struct rusage u;getrusage(RUSAGE_SELF,&u);return u.ru_maxrss;}

static char *read_stdin(void){
    size_t cap=1<<16,n=0;char *b=malloc(cap);int c;
    while((c=getchar())!=EOF){if(n+2>cap){cap<<=1;b=realloc(b,cap);}b[n++]=c;}
    b[n]='\0';return b;
}

static size_t jdecode(const char *s,char *d){
    size_t n=0;
    while(*s&&*s!='"'){
        if(*s=='\\'){s++;switch(*s){
            case '"':d[n++]='"';break;case '\\':d[n++]='\\';break;
            case 'n':d[n++]='\n';break;case 'r':d[n++]='\r';break;
            case 't':d[n++]='\t';break;default:d[n++]=*s;break;
        }}else d[n++]=*s;s++;
    }d[n]='\0';return n;
}

static char *get_input_str(const char *json){
    const char *p=strstr(json,"\"input\"");if(!p)return strdup("");
    p+=7;while(*p==' '||*p==':'||*p=='\t'||*p=='\n')p++;
    if(*p!='"')return strdup("");p++;
    char *out=malloc(strlen(p)+1);jdecode(p,out);return out;
}

static char *jencode(const char *s){
    char *o=malloc(strlen(s)*6+3),*p=o;
    while(*s){unsigned char c=(unsigned char)*s++;
        if(c=='"'){*p++='\\';*p++='"';}
        else if(c=='\\'){*p++='\\';*p+='\\';}
        else if(c=='\n'){*p++='\\';*p++='n';}
        else if(c=='\r'){*p++='\\';*p++='r';}
        else if(c=='\t'){*p++='\\';*p++='t';}
        else if(c<0x20){p+=sprintf(p,"\\u%04x",c);}
        else *p++=c;
    }*p='\0';return o;
}

typedef struct{char *s;size_t n,cap;}Buf;
static void b_init(Buf *b){b->cap=4096;b->n=0;b->s=malloc(b->cap);b->s[0]=0;}
static void b_cat(Buf *b,const char *t){
    size_t l=strlen(t);
    if(b->n+l+1>b->cap){while(b->n+l+1>b->cap)b->cap<<=1;b->s=realloc(b->s,b->cap);}
    memcpy(b->s+b->n,t,l+1);b->n+=l;
}
static void b_cat_free(Buf *b,char *t){if(t){b_cat(b,t);free(t);}}

/* parse one whitespace-delimited token from *pp, advance *pp */
static int next_tok(char **pp,char *dst,int cap){
    while(**pp==' '||**pp=='\t')(*pp)++;
    if(!**pp||**pp=='\n')return 0;
    int n=0;
    while(**pp&&**pp!=' '&&**pp!='\t'&&**pp!='\n'&&n<cap-1)dst[n++]=*(*pp)++;
    dst[n]='\0';return 1;
}

int main(void){
    char *raw=read_stdin();
    char *input=get_input_str(raw);
    free(raw);

    Buf out;b_init(&out);
    VFS *v=vfs_create();

    struct timespec t0,t1;
    clock_gettime(CLOCK_MONOTONIC,&t0);

    char *lctx=NULL;
    char *line=strtok_r(input,"\n",&lctx);
    while(line){
        /* strip \r */
        size_t ll=strlen(line);
        if(ll&&line[ll-1]=='\r')line[ll-1]='\0';

        char *p=line;
        char cmd[32]="";
        if(!next_tok(&p,cmd,sizeof(cmd))){line=strtok_r(NULL,"\n",&lctx);continue;}

        if(strcmp(cmd,"MKDIR")==0){
            char path[512]="";next_tok(&p,path,sizeof(path));
            b_cat_free(&out,vfs_mkdir(v,path));
        } else if(strcmp(cmd,"TOUCH")==0){
            char path[512]="";next_tok(&p,path,sizeof(path));
            b_cat_free(&out,vfs_touch(v,path));
        } else if(strcmp(cmd,"WRITE")==0){
            char path[512]="";next_tok(&p,path,sizeof(path));
            while(*p==' ')p++;
            b_cat_free(&out,vfs_write(v,path,p));
        } else if(strcmp(cmd,"READ")==0){
            char path[512]="";next_tok(&p,path,sizeof(path));
            b_cat_free(&out,vfs_read(v,path));
        } else if(strcmp(cmd,"LS")==0){
            char path[512]="";next_tok(&p,path,sizeof(path));
            b_cat_free(&out,vfs_ls(v,path));
        } else if(strcmp(cmd,"RM")==0){
            char next[512]="";next_tok(&p,next,sizeof(next));
            if(strcmp(next,"-r")==0){
                char path[512]="";next_tok(&p,path,sizeof(path));
                b_cat_free(&out,vfs_rmr(v,path));
            } else {
                b_cat_free(&out,vfs_rm(v,next));
            }
        } else if(strcmp(cmd,"MV")==0){
            char src[512]="",dst[512]="";
            next_tok(&p,src,sizeof(src));next_tok(&p,dst,sizeof(dst));
            b_cat_free(&out,vfs_mv(v,src,dst));
        } else if(strcmp(cmd,"CP")==0){
            char src[512]="",dst[512]="";
            next_tok(&p,src,sizeof(src));next_tok(&p,dst,sizeof(dst));
            b_cat_free(&out,vfs_cp(v,src,dst));
        } else if(strcmp(cmd,"FIND")==0){
            char path[512]="",name[256]="";
            next_tok(&p,path,sizeof(path));next_tok(&p,name,sizeof(name));
            b_cat_free(&out,vfs_find(v,path,name));
        }

        line=strtok_r(NULL,"\n",&lctx);
    }

    clock_gettime(CLOCK_MONOTONIC,&t1);
    double ms=(t1.tv_sec-t0.tv_sec)*1000.0+(t1.tv_nsec-t0.tv_nsec)/1e6;
    long mem=peak_kb();
    vfs_destroy(v);
    free(input);

    char *enc=jencode(out.s);free(out.s);
    printf("__BEGIN_RESULT__{\"actual_output\":\"%s\",\"time_ms\":%.6g,\"memory_kb\":%ld}__END_RESULT__",
           enc,ms,mem);
    free(enc);
    return 0;
}
