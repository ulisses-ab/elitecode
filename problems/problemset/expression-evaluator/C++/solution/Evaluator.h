#include <bits/stdc++.h>

// Recursive-descent parser for arithmetic expressions.
//
// Grammar:
//   expr    → term   (('+' | '-') term)*
//   term    → unary  (('*' | '/') unary)*
//   unary   → '-' unary | primary
//   primary → number | ident | ident '(' arglist ')' | '(' expr ')'
//   arglist → expr (',' expr)*

class Evaluator {
    std::unordered_map<std::string, double> vars;

    struct Parser {
        const std::string& s;
        size_t pos;
        const std::unordered_map<std::string, double>& vars;

        Parser(const std::string& s, const std::unordered_map<std::string, double>& vars)
            : s(s), pos(0), vars(vars) {}

        void skip() {
            while (pos < s.size() && isspace((unsigned char)s[pos])) pos++;
        }

        double expr() {
            double v = term();
            skip();
            while (pos < s.size() && (s[pos] == '+' || s[pos] == '-')) {
                char op = s[pos++];
                double r = term();
                v = op == '+' ? v + r : v - r;
                skip();
            }
            return v;
        }

        double term() {
            double v = unary();
            skip();
            while (pos < s.size() && (s[pos] == '*' || s[pos] == '/')) {
                char op = s[pos++];
                double r = unary();
                v = op == '*' ? v * r : v / r;
                skip();
            }
            return v;
        }

        double unary() {
            skip();
            if (pos < s.size() && s[pos] == '-') { pos++; return -unary(); }
            return primary();
        }

        double primary() {
            skip();
            if (pos < s.size() && s[pos] == '(') {
                pos++;
                double v = expr();
                skip();
                if (pos < s.size() && s[pos] == ')') pos++;
                return v;
            }
            if (pos < s.size() && (isdigit((unsigned char)s[pos]) || s[pos] == '.')) {
                size_t start = pos;
                while (pos < s.size() && (isdigit((unsigned char)s[pos]) || s[pos] == '.')) pos++;
                return std::stod(s.substr(start, pos - start));
            }
            if (pos < s.size() && isalpha((unsigned char)s[pos])) {
                size_t start = pos;
                while (pos < s.size() && isalnum((unsigned char)s[pos])) pos++;
                std::string name = s.substr(start, pos - start);
                skip();
                if (pos < s.size() && s[pos] == '(') {
                    pos++;
                    std::vector<double> args;
                    skip();
                    if (pos < s.size() && s[pos] != ')') {
                        args.push_back(expr());
                        skip();
                        while (pos < s.size() && s[pos] == ',') {
                            pos++;
                            args.push_back(expr());
                            skip();
                        }
                    }
                    if (pos < s.size() && s[pos] == ')') pos++;
                    if (name == "min") return std::min(args[0], args[1]);
                    if (name == "max") return std::max(args[0], args[1]);
                    if (name == "abs") return std::abs(args[0]);
                    if (name == "pow") return std::pow(args[0], args[1]);
                    return 0;
                }
                auto it = vars.find(name);
                return it != vars.end() ? it->second : 0.0;
            }
            return 0;
        }
    };

public:
    void set(const std::string& name, double value) {
        vars[name] = value;
    }

    double eval(const std::string& expression) {
        Parser p(expression, vars);
        return p.expr();
    }
};
