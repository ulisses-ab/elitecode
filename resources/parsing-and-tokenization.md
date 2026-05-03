# How programs understand text

Think of this as how a program “reads” something like:

```
3 + (4 * 2)
```


At first, this is just a string of characters. The program needs to turn it into something structured before it can compute anything.

---

## Step 1 — Breaking text into pieces (Lexing)

The program scans the text and groups characters into meaningful chunks.

```
3 + (4 * 2)
```

becomes:

- `3`
- `+`
- `(`
- `4`
- `*`
- `2`
- `)`

These chunks are called **tokens**.

You can think of tokens like words in a sentence.  
Spaces and comments are ignored because they don’t change the meaning.

---

## Step 2 — Understanding the structure (Parsing)

Now the program figures out how those tokens fit together.

It builds a **tree structure** that represents the expression.

For example:

```
3 + 4 * 2
```

becomes:

```
   +
  / \
 3   *
    / \
   4   2
```


This shows that:
- `4 * 2` happens first
- then `+ 3`

---

## How the parser works (step by step)

The parser reads the tokens from left to right and **builds the tree as it goes**.

It always keeps track of a **current piece**, and when it sees an operator, it tries to **attach something to it**.

---

### Example: `3 + 4 * 2`

Let’s walk through exactly what happens.

---

### Step 1 — read the first value

The parser starts by reading a basic value:

```
3
```

So it has:

```
current = 3
```


---

### Step 2 — see `+`

Now it sees:

```
+
```


This means:

> “I need to combine what I have (`3`) with something on the right”

So now it needs to figure out what the **right side** is.

---

### Step 3 — build the right side (the key step)

The parser looks ahead and sees:

```
4 * 2
```

At first, it reads `4`.

But then it sees `*`, which means:

> “this isn’t just `4` — it’s a bigger piece”

So it builds that first:

```
   *
  / \
 4   2
```


Now the right side is the whole `4 * 2`, not just `4`.

---

### Step 4 — combine everything

Now the parser has:

- left: `3`
- operator: `+`
- right: `(4 * 2)`

So it builds:

```
   +
  / \
 3   *
    / \
   4   2
```


---

## The key idea

> When the parser needs the “right side”, it builds **as much as it can** before combining.

That’s why `4 * 2` stays together.

---

## Another example: `3 * 4 + 2`

Let’s flip the order:

```
3 * 4 + 2
```

---

### Step 1

```
current = 3
```


---

### Step 2 — see `*`

- parse right side → `4`
- build:

```
   *
  / \
 3   4
```

Now:

```
current = (3 * 4)
```


---


### Step 3 — see `+`

- parse right side → `2`
- build:

```
   +
  / \
 *   2
/ \
3  4
```


---

## Why this works

The parser always follows this pattern:

1. Start with a value  
2. While there’s an operator:
   - read the operator  
   - build the right side completely  
   - combine into a bigger piece  

So the tree grows step by step, and each new piece can itself be a whole subtree.

---

## Parentheses

Parentheses tell the program:

> “treat this part as a single piece”

So in:

```
3 + (4 * 2)
```


the parser:
1. fully builds `4 * 2`
2. treats it as one unit
3. then combines it with `3`

---

## Evaluating the result

Once the tree is built, computing the result is simple.

Start from the bottom:


```
   +
  / \
 3   *
    / \
   4   2
```


- `4 * 2 = 8`
- `3 + 8 = 11`

---
