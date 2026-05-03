#define _POSIX_C_SOURCE 200809L
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <sys/resource.h>
#include "../code/Interpreter.h"

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

int main(void){
    char *raw=read_stdin();
    char *source=get_input_str(raw);
    free(raw);

    struct timespec t0,t1;
    clock_gettime(CLOCK_MONOTONIC,&t0);

    Interpreter *interp=interp_create();
    char *result=interp_run(interp,source);
    interp_destroy(interp);

    clock_gettime(CLOCK_MONOTONIC,&t1);
    double ms=(t1.tv_sec-t0.tv_sec)*1000.0+(t1.tv_nsec-t0.tv_nsec)/1e6;
    long mem=peak_kb();
    free(source);

    char *enc=jencode(result?result:"");
    if(result)free(result);
    printf("__BEGIN_RESULT__{\"actual_output\":\"%s\",\"time_ms\":%.6g,\"memory_kb\":%ld}__END_RESULT__",
           enc,ms,mem);
    free(enc);
    return 0;
}
