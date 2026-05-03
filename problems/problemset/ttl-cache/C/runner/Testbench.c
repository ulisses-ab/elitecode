#define _POSIX_C_SOURCE 200809L
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <sys/resource.h>
#include "../code/TTLCache.h"

static long peak_kb(void) { struct rusage u; getrusage(RUSAGE_SELF,&u); return u.ru_maxrss; }

static char *read_stdin(void) {
    size_t cap=1<<16,n=0; char *b=malloc(cap); int c;
    while((c=getchar())!=EOF){ if(n+2>cap){cap<<=1;b=realloc(b,cap);} b[n++]=c; }
    b[n]='\0'; return b;
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

int main(void){
    char *raw=read_stdin();
    char *input=get_input_str(raw);
    free(raw);

    Buf out;b_init(&out);
    TTLCache *cache=ttlcache_create();

    struct timespec t0,t1;
    clock_gettime(CLOCK_MONOTONIC,&t0);

    char *tok=strtok(input," \t\n\r");
    while(tok){
        if(strcmp(tok,"SET")==0){
            char *key=strtok(NULL," \t\n\r");
            char *val=strtok(NULL," \t\n\r");
            long long ttl=atoll(strtok(NULL," \t\n\r"));
            ttlcache_set(cache,key,val,ttl);
        } else if(strcmp(tok,"GET")==0){
            char *key=strtok(NULL," \t\n\r");
            const char *val=ttlcache_get(cache,key);
            b_cat(&out, val ? val : "\"\"");
            b_cat(&out,"\n");
        } else if(strcmp(tok,"DEL")==0){
            char *key=strtok(NULL," \t\n\r");
            ttlcache_del(cache,key);
        } else if(strcmp(tok,"SIZE")==0){
            char tmp[32]; sprintf(tmp,"%d\n",ttlcache_size(cache));
            b_cat(&out,tmp);
        } else if(strcmp(tok,"TICK")==0){
            long long delta=atoll(strtok(NULL," \t\n\r"));
            ttlcache_tick(cache,delta);
        }
        tok=strtok(NULL," \t\n\r");
    }

    clock_gettime(CLOCK_MONOTONIC,&t1);
    double ms=(t1.tv_sec-t0.tv_sec)*1000.0+(t1.tv_nsec-t0.tv_nsec)/1e6;
    long mem=peak_kb();
    ttlcache_destroy(cache);
    free(input);

    char *enc=jencode(out.s);free(out.s);
    printf("__BEGIN_RESULT__{\"actual_output\":\"%s\",\"time_ms\":%.6g,\"memory_kb\":%ld}__END_RESULT__",
           enc,ms,mem);
    free(enc);
    return 0;
}
