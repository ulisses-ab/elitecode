#define _POSIX_C_SOURCE 200809L
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <sys/resource.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <pthread.h>
#include "../code/MiniRedis.h"

static const int PORT = 16379;

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
static void b_catn(Buf *b,const char *t,size_t l){
    if(b->n+l+1>b->cap){while(b->n+l+1>b->cap)b->cap<<=1;b->s=realloc(b->s,b->cap);}
    memcpy(b->s+b->n,t,l);b->s[b->n+l]='\0';b->n+=l;
}

/* ---- RESP helpers ---- */

static void rread_exact(int fd,char *dst,int n){
    int got=0;
    while(got<n){int r=read(fd,dst+got,n-got);if(r<=0)break;got+=r;}
}

static void rread_line(int fd,Buf *line){
    char c;
    b_init(line);
    while(read(fd,&c,1)==1){
        if(c=='\n')break;
        if(c!='\r')b_cat(line,(char[]){c,0});
    }
}

static void read_resp(int fd,Buf *out){
    Buf line;rread_line(fd,&line);
    if(!line.n){free(line.s);return;}
    char type=line.s[0];
    char *rest=line.s+1;

    if(type=='+'||type=='-'){
        b_cat(out,(char[]){type,0});b_cat(out,rest);b_cat(out,"\n");
    } else if(type==':'){
        b_cat(out,":");b_cat(out,rest);b_cat(out,"\n");
    } else if(type=='$'){
        int len=atoi(rest);
        b_cat(out,"$");b_cat(out,rest);b_cat(out,"\n");
        if(len>=0){
            char *buf=malloc(len+2);
            rread_exact(fd,buf,len+2); /* data + \r\n */
            b_catn(out,buf,len);b_cat(out,"\n");
            free(buf);
        }
    } else if(type=='*'){
        int count=atoi(rest);
        b_cat(out,"*");b_cat(out,rest);b_cat(out,"\n");
        for(int i=0;i<count&&count>0;i++) read_resp(fd,out);
    }
    free(line.s);
}

static void send_command(int fd,char **args,int argc){
    Buf msg;b_init(&msg);
    char tmp[32];
    sprintf(tmp,"*%d\r\n",argc);b_cat(&msg,tmp);
    for(int i=0;i<argc;i++){
        sprintf(tmp,"$%zu\r\n",(size_t)strlen(args[i]));
        b_cat(&msg,tmp);b_cat(&msg,args[i]);b_cat(&msg,"\r\n");
    }
    write(fd,msg.s,msg.n);
    free(msg.s);
}

/* ---- server thread ---- */

static void *server_thread(void *arg){
    (void)arg;
    mini_redis_start(PORT);
    return NULL;
}

int main(void){
    char *raw=read_stdin();
    char *input=get_input_str(raw);
    free(raw);

    /* collect commands */
    char ***cmds=NULL; int *cmd_argc=NULL; int ncmds=0;
    {
        char *lctx=NULL;
        char *line=strtok_r(input,"\n",&lctx);
        while(line){
            size_t ll=strlen(line);
            if(ll&&line[ll-1]=='\r')line[ll-1]='\0';
            /* tokenize line */
            char *toks[64]; int tc=0;
            char *tok=strtok(line," \t");
            while(tok&&tc<64){toks[tc++]=tok;tok=strtok(NULL," \t");}
            if(tc>0){
                cmds=realloc(cmds,(ncmds+1)*sizeof(*cmds));
                cmd_argc=realloc(cmd_argc,(ncmds+1)*sizeof(*cmd_argc));
                cmds[ncmds]=malloc(tc*sizeof(char*));
                for(int i=0;i<tc;i++) cmds[ncmds][i]=strdup(toks[i]);
                cmd_argc[ncmds]=tc;
                ncmds++;
            }
            line=strtok_r(NULL,"\n",&lctx);
        }
    }

    pthread_t tid;
    pthread_create(&tid,NULL,server_thread,NULL);
    pthread_detach(tid);

    /* connect with retries */
    int cfd=-1;
    for(int i=0;i<100;i++){
        struct timespec ts={0,10000000};nanosleep(&ts,NULL);
        cfd=socket(AF_INET,SOCK_STREAM,0);
        struct sockaddr_in addr={0};
        addr.sin_family=AF_INET;
        addr.sin_port=htons(PORT);
        inet_pton(AF_INET,"127.0.0.1",&addr.sin_addr);
        if(connect(cfd,(struct sockaddr*)&addr,sizeof(addr))==0) break;
        close(cfd);cfd=-1;
    }

    Buf out;b_init(&out);

    if(cfd<0){
        b_cat(&out,"ERROR: could not connect to server\n");
    } else {
        struct timespec t0,t1;
        clock_gettime(CLOCK_MONOTONIC,&t0);

        for(int i=0;i<ncmds;i++){
            send_command(cfd,cmds[i],cmd_argc[i]);
            read_resp(cfd,&out);
        }

        clock_gettime(CLOCK_MONOTONIC,&t1);
        close(cfd);
    }

    long mem=peak_kb();
    free(input);
    for(int i=0;i<ncmds;i++){
        for(int j=0;j<cmd_argc[i];j++) free(cmds[i][j]);
        free(cmds[i]);
    }
    free(cmds);free(cmd_argc);

    char *enc=jencode(out.s);free(out.s);
    printf("__BEGIN_RESULT__{\"actual_output\":\"%s\",\"time_ms\":0,\"memory_kb\":%ld}__END_RESULT__",
           enc,mem);
    free(enc);
    return 0;
}
