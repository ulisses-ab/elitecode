#define _POSIX_C_SOURCE 200809L
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <sys/resource.h>
#include "../code/two_sum.h"

static long peak_kb(void){struct rusage u;getrusage(RUSAGE_SELF,&u);return u.ru_maxrss;}

static char *read_stdin(void){
    size_t cap=1<<16,n=0;char *b=malloc(cap);int c;
    while((c=getchar())!=EOF){if(n+2>cap){cap<<=1;b=realloc(b,cap);}b[n++]=c;}
    b[n]='\0';return b;
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

/* Extract nums array and target from {"input":{"nums":[...],"target":N}} */
static int *parse_nums(const char *json,int *count){
    const char *p=strstr(json,"\"nums\"");if(!p){*count=0;return NULL;}
    p=strchr(p,'[');if(!p){*count=0;return NULL;}p++;
    int cap=64,n=0;int *arr=malloc(cap*sizeof(int));
    while(*p&&*p!=']'){
        while(*p==' '||*p==',')p++;
        if(*p==']')break;
        char *end;arr[n++]=(int)strtol(p,&end,10);
        if(n==cap){cap*=2;arr=realloc(arr,cap*sizeof(int));}
        p=end;
    }
    *count=n;return arr;
}

static int parse_target(const char *json){
    const char *p=strstr(json,"\"target\"");if(!p)return 0;
    p+=8;while(*p==' '||*p==':')p++;
    return(int)strtol(p,NULL,10);
}

int main(void){
    char *raw=read_stdin();

    int count=0;
    int *nums=parse_nums(raw,&count);
    int target=parse_target(raw);
    free(raw);

    struct timespec t0,t1;
    clock_gettime(CLOCK_MONOTONIC,&t0);

    int oi=0,oj=0;
    two_sum(nums,count,target,&oi,&oj);

    clock_gettime(CLOCK_MONOTONIC,&t1);
    double ms=(t1.tv_sec-t0.tv_sec)*1000.0+(t1.tv_nsec-t0.tv_nsec)/1e6;
    long mem=peak_kb();
    free(nums);

    char res[64];
    sprintf(res,"[%d,%d]",oi,oj);
    char *enc=jencode(res);
    printf("__BEGIN_RESULT__{\"actual_output\":\"%s\",\"time_ms\":%.6g,\"memory_kb\":%ld}__END_RESULT__",
           enc,ms,mem);
    free(enc);
    return 0;
}
