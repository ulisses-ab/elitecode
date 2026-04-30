#include <bits/stdc++.h>

class Evaluator {
public:
    // Assign a numeric value to a variable name.
    void set(const std::string& name, double value);

    // Parse and evaluate an arithmetic expression. Variables previously set
    // via set() are in scope. Returns the numeric result.
    double eval(const std::string& expression);
};
