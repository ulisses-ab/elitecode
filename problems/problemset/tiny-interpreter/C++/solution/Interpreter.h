#include <bits/stdc++.h>
using namespace std;

// ─── Token ───────────────────────────────────────────────────────────────────

enum class TT {
    NUM, IDENT,
    KW_IF, KW_ELIF, KW_ELSE, KW_WHILE, KW_DEF, KW_RETURN, KW_PRINT,
    KW_AND, KW_OR, KW_NOT,
    PLUS, MINUS, STAR, SLASH, PERCENT,
    EQ, NEQ, LT, LE, GT, GE, ASSIGN,
    LPAREN, RPAREN, COMMA, COLON,
    NEWLINE, INDENT, DEDENT, END
};

struct Token {
    TT        type;
    string    text;
    long long num = 0;
};

// ─── Lexer ────────────────────────────────────────────────────────────────────

static vector<Token> lex(const string& src) {
    static const unordered_map<string, TT> kw = {
        {"if",TT::KW_IF},{"elif",TT::KW_ELIF},{"else",TT::KW_ELSE},
        {"while",TT::KW_WHILE},{"def",TT::KW_DEF},{"return",TT::KW_RETURN},
        {"print",TT::KW_PRINT},{"and",TT::KW_AND},{"or",TT::KW_OR},{"not",TT::KW_NOT}
    };

    vector<Token> out;
    vector<int>   indents = {0};

    auto emit = [&](TT t, const string& s = "", long long n = 0) {
        out.push_back({t, s, n});
    };

    istringstream ss(src);
    string line;

    while (getline(ss, line)) {
        size_t first = line.find_first_not_of(" \t");
        if (first == string::npos || line[first] == '#') continue;

        int ind = (int)first;
        if (ind > indents.back()) {
            indents.push_back(ind);
            emit(TT::INDENT);
        } else {
            while (ind < indents.back()) {
                indents.pop_back();
                emit(TT::DEDENT);
            }
        }

        size_t i = first;
        while (i < line.size()) {
            char c = line[i];
            if (isspace(c)) { i++; continue; }
            if (c == '#') break;

            if (isdigit(c)) {
                size_t s = i;
                while (i < line.size() && isdigit(line[i])) i++;
                string t = line.substr(s, i - s);
                emit(TT::NUM, t, stoll(t));
                continue;
            }
            if (isalpha(c) || c == '_') {
                size_t s = i;
                while (i < line.size() && (isalnum(line[i]) || line[i] == '_')) i++;
                string t = line.substr(s, i - s);
                auto it = kw.find(t);
                emit(it != kw.end() ? it->second : TT::IDENT, t);
                continue;
            }
            // two-char ops
            if (i + 1 < line.size()) {
                string two = line.substr(i, 2);
                if (two=="=="){emit(TT::EQ,two);i+=2;continue;}
                if (two=="!="){emit(TT::NEQ,two);i+=2;continue;}
                if (two=="<="){emit(TT::LE,two);i+=2;continue;}
                if (two==">="){emit(TT::GE,two);i+=2;continue;}
            }
            switch (c) {
                case '+': emit(TT::PLUS,"+"); break;
                case '-': emit(TT::MINUS,"-"); break;
                case '*': emit(TT::STAR,"*"); break;
                case '/': emit(TT::SLASH,"/"); break;
                case '%': emit(TT::PERCENT,"%"); break;
                case '=': emit(TT::ASSIGN,"="); break;
                case '<': emit(TT::LT,"<"); break;
                case '>': emit(TT::GT,">"); break;
                case '(': emit(TT::LPAREN,"("); break;
                case ')': emit(TT::RPAREN,")"); break;
                case ',': emit(TT::COMMA,","); break;
                case ':': emit(TT::COLON,":"); break;
            }
            i++;
        }
        emit(TT::NEWLINE);
    }
    while (indents.size() > 1) { indents.pop_back(); emit(TT::DEDENT); }
    emit(TT::END);
    return out;
}

// ─── AST ─────────────────────────────────────────────────────────────────────

struct Expr { virtual ~Expr() = default; };
using EP = unique_ptr<Expr>;

struct NumExpr   : Expr { long long val; NumExpr(long long v):val(v){} };
struct VarExpr   : Expr { string name;  VarExpr(string n):name(move(n)){} };
struct BinExpr   : Expr { string op; EP l, r; };
struct UnaryExpr : Expr { string op; EP e; };
struct CallExpr  : Expr { string name; vector<EP> args; };

struct Stmt { virtual ~Stmt() = default; };
using SP = unique_ptr<Stmt>;
using Block = vector<SP>;

struct AssignStmt : Stmt { string name; EP val; };
struct PrintStmt  : Stmt { EP expr; };
struct ReturnStmt : Stmt { EP expr; };
struct ExprStmt   : Stmt { EP expr; };
struct IfStmt     : Stmt { vector<pair<EP,Block>> branches; Block elseBranch; };
struct WhileStmt  : Stmt { EP cond; Block body; };
struct FuncDef    : Stmt { string name; vector<string> params; Block body; };

// ─── Parser ──────────────────────────────────────────────────────────────────

struct Parser {
    vector<Token>& tok;
    size_t pos = 0;

    TT cur()  { return tok[pos].type; }
    TT peek() { return pos+1 < tok.size() ? tok[pos+1].type : TT::END; }
    Token consume() { return tok[pos++]; }
    Token expect(TT t) { assert(tok[pos].type == t); return tok[pos++]; }
    bool at(TT t) { return cur() == t; }
    void skipNL() { while (at(TT::NEWLINE)) pos++; }

    Block parseBlock() {
        expect(TT::INDENT);
        Block b;
        while (!at(TT::DEDENT) && !at(TT::END))
            b.push_back(parseStmt());
        if (at(TT::DEDENT)) pos++;
        return b;
    }

    SP parseStmt() {
        skipNL();
        if (at(TT::KW_IF))    return parseIf();
        if (at(TT::KW_WHILE)) return parseWhile();
        if (at(TT::KW_DEF))   return parseDef();
        if (at(TT::KW_RETURN)) {
            pos++;
            auto s = make_unique<ReturnStmt>(); s->expr = parseExpr();
            if (at(TT::NEWLINE)) pos++;
            return s;
        }
        if (at(TT::KW_PRINT)) {
            pos++; expect(TT::LPAREN);
            auto s = make_unique<PrintStmt>(); s->expr = parseExpr();
            expect(TT::RPAREN);
            if (at(TT::NEWLINE)) pos++;
            return s;
        }
        if (at(TT::IDENT) && peek() == TT::ASSIGN) {
            auto s = make_unique<AssignStmt>();
            s->name = consume().text; pos++; // consume ASSIGN
            s->val  = parseExpr();
            if (at(TT::NEWLINE)) pos++;
            return s;
        }
        auto s = make_unique<ExprStmt>(); s->expr = parseExpr();
        if (at(TT::NEWLINE)) pos++;
        return s;
    }

    SP parseIf() {
        auto s = make_unique<IfStmt>();
        pos++; // consume IF
        auto cond = parseExpr(); expect(TT::COLON);
        if (at(TT::NEWLINE)) pos++;
        s->branches.push_back({move(cond), parseBlock()});
        while (at(TT::KW_ELIF)) {
            pos++;
            auto c = parseExpr(); expect(TT::COLON);
            if (at(TT::NEWLINE)) pos++;
            s->branches.push_back({move(c), parseBlock()});
        }
        if (at(TT::KW_ELSE)) {
            pos++; expect(TT::COLON);
            if (at(TT::NEWLINE)) pos++;
            s->elseBranch = parseBlock();
        }
        return s;
    }

    SP parseWhile() {
        pos++;
        auto s = make_unique<WhileStmt>();
        s->cond = parseExpr(); expect(TT::COLON);
        if (at(TT::NEWLINE)) pos++;
        s->body = parseBlock();
        return s;
    }

    SP parseDef() {
        pos++;
        auto s = make_unique<FuncDef>();
        s->name = expect(TT::IDENT).text;
        expect(TT::LPAREN);
        while (!at(TT::RPAREN)) {
            s->params.push_back(expect(TT::IDENT).text);
            if (at(TT::COMMA)) pos++;
        }
        expect(TT::RPAREN); expect(TT::COLON);
        if (at(TT::NEWLINE)) pos++;
        s->body = parseBlock();
        return s;
    }

    EP parseExpr()   { return parseOr(); }
    EP parseOr()     { return parseBin({TT::KW_OR},  [this]{ return parseAnd(); }); }
    EP parseAnd()    { return parseBin({TT::KW_AND}, [this]{ return parseNot(); }); }

    template<typename F>
    EP parseBin(initializer_list<TT> ops, F next) {
        auto l = next();
        set<TT> opset(ops);
        while (opset.count(cur())) {
            auto op = consume().text;
            auto r  = next();
            auto e  = make_unique<BinExpr>(); e->op = op; e->l = move(l); e->r = move(r);
            l = move(e);
        }
        return l;
    }

    EP parseNot() {
        if (at(TT::KW_NOT)) {
            pos++;
            auto e = make_unique<UnaryExpr>(); e->op = "not"; e->e = parseNot();
            return e;
        }
        return parseCmp();
    }

    EP parseCmp() {
        auto l = parseAdd();
        static const set<TT> cmp = {TT::EQ,TT::NEQ,TT::LT,TT::LE,TT::GT,TT::GE};
        if (cmp.count(cur())) {
            auto op = consume().text;
            auto r  = parseAdd();
            auto e  = make_unique<BinExpr>(); e->op = op; e->l = move(l); e->r = move(r);
            return e;
        }
        return l;
    }

    EP parseAdd() {
        auto l = parseMul();
        while (at(TT::PLUS) || at(TT::MINUS)) {
            auto op = consume().text; auto r = parseMul();
            auto e = make_unique<BinExpr>(); e->op = op; e->l = move(l); e->r = move(r);
            l = move(e);
        }
        return l;
    }

    EP parseMul() {
        auto l = parseUnary();
        while (at(TT::STAR) || at(TT::SLASH) || at(TT::PERCENT)) {
            auto op = consume().text; auto r = parseUnary();
            auto e = make_unique<BinExpr>(); e->op = op; e->l = move(l); e->r = move(r);
            l = move(e);
        }
        return l;
    }

    EP parseUnary() {
        if (at(TT::MINUS)) {
            pos++;
            auto e = make_unique<UnaryExpr>(); e->op = "-"; e->e = parseUnary();
            return e;
        }
        return parsePrimary();
    }

    EP parsePrimary() {
        if (at(TT::NUM)) { auto t = consume(); return make_unique<NumExpr>(t.num); }
        if (at(TT::IDENT)) {
            auto name = consume().text;
            if (at(TT::LPAREN)) {
                pos++;
                auto e = make_unique<CallExpr>(); e->name = name;
                while (!at(TT::RPAREN)) {
                    e->args.push_back(parseExpr());
                    if (at(TT::COMMA)) pos++;
                }
                pos++;
                return e;
            }
            return make_unique<VarExpr>(name);
        }
        if (at(TT::LPAREN)) {
            pos++; auto e = parseExpr(); expect(TT::RPAREN);
            return e;
        }
        return make_unique<NumExpr>(0);
    }

    Block parse() {
        Block b; skipNL();
        while (!at(TT::END)) { b.push_back(parseStmt()); skipNL(); }
        return b;
    }
};

// ─── Interpreter ─────────────────────────────────────────────────────────────

struct ReturnSignal { long long value; };

class Interpreter {
    using Env = unordered_map<string, long long>;
    Env globals;
    unordered_map<string, FuncDef*> funcs;
    string output;

    long long eval(Expr& expr, Env& env) {
        if (auto* e = dynamic_cast<NumExpr*>(&expr))
            return e->val;

        if (auto* e = dynamic_cast<VarExpr*>(&expr)) {
            auto it = env.find(e->name);
            if (it != env.end()) return it->second;
            auto it2 = globals.find(e->name);
            return it2 != globals.end() ? it2->second : 0;
        }

        if (auto* e = dynamic_cast<UnaryExpr*>(&expr)) {
            long long v = eval(*e->e, env);
            if (e->op == "-")   return -v;
            if (e->op == "not") return v ? 0 : 1;
        }

        if (auto* e = dynamic_cast<BinExpr*>(&expr)) {
            // short-circuit
            if (e->op == "and") { long long l = eval(*e->l, env); return l ? eval(*e->r, env) : 0; }
            if (e->op == "or")  { long long l = eval(*e->l, env); return l ? l : eval(*e->r, env); }
            long long l = eval(*e->l, env), r = eval(*e->r, env);
            if (e->op == "+")  return l + r;
            if (e->op == "-")  return l - r;
            if (e->op == "*")  return l * r;
            if (e->op == "/")  return l / r;
            if (e->op == "%")  return l % r;
            if (e->op == "==") return l == r;
            if (e->op == "!=") return l != r;
            if (e->op == "<")  return l < r;
            if (e->op == "<=") return l <= r;
            if (e->op == ">")  return l > r;
            if (e->op == ">=") return l >= r;
        }

        if (auto* e = dynamic_cast<CallExpr*>(&expr)) {
            auto it = funcs.find(e->name);
            if (it == funcs.end()) return 0;
            FuncDef* fn = it->second;
            Env local;
            for (size_t i = 0; i < fn->params.size() && i < e->args.size(); i++)
                local[fn->params[i]] = eval(*e->args[i], env);
            try { exec(fn->body, local); }
            catch (ReturnSignal& ret) { return ret.value; }
            return 0;
        }
        return 0;
    }

    void exec(const Block& block, Env& env) {
        for (auto& s : block) exec(*s, env);
    }

    void exec(Stmt& stmt, Env& env) {
        if (auto* s = dynamic_cast<AssignStmt*>(&stmt)) {
            env[s->name] = eval(*s->val, env);
        } else if (auto* s = dynamic_cast<PrintStmt*>(&stmt)) {
            output += to_string(eval(*s->expr, env)) + "\n";
        } else if (auto* s = dynamic_cast<ReturnStmt*>(&stmt)) {
            throw ReturnSignal{eval(*s->expr, env)};
        } else if (auto* s = dynamic_cast<IfStmt*>(&stmt)) {
            for (auto& [cond, body] : s->branches) {
                if (eval(*cond, env)) { exec(body, env); return; }
            }
            if (!s->elseBranch.empty()) exec(s->elseBranch, env);
        } else if (auto* s = dynamic_cast<WhileStmt*>(&stmt)) {
            while (eval(*s->cond, env)) exec(s->body, env);
        } else if (auto* s = dynamic_cast<FuncDef*>(&stmt)) {
            funcs[s->name] = s;
        } else if (auto* s = dynamic_cast<ExprStmt*>(&stmt)) {
            eval(*s->expr, env);
        }
    }

public:
    string run(const string& source) {
        output.clear(); globals.clear(); funcs.clear();
        auto tokens = lex(source);
        Parser p{tokens};
        Block program = p.parse();
        // register top-level function defs before executing so forward calls work
        for (auto& s : program)
            if (auto* f = dynamic_cast<FuncDef*>(s.get()))
                funcs[f->name] = f;
        try { exec(program, globals); }
        catch (ReturnSignal&) {}
        return output;
    }
};
