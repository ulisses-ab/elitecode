Implement a **URL router** that registers route patterns and matches incoming requests to them, extracting path parameters.

Patterns use `:name` segments to capture variable parts of a URL. Static segments take priority over parameterized ones when both could match.

Implement a `Router` class with:

- `Router()` — constructor.
- `void registerRoute(const std::string& method, const std::string& pattern)` — register a route. Methods are uppercase strings (e.g. `GET`, `POST`). Patterns start with `/` and may contain `:param` segments (e.g. `/users/:id/posts/:postId`).
- `RouteMatch match(const std::string& method, const std::string& url) const` — find the best matching route for the given method and URL. Returns a `RouteMatch` with `pattern` set to the matched pattern (or `""` if no match) and `params` as an ordered list of `(name, value)` pairs in the order the params appear in the pattern.

The `RouteMatch` struct is already defined for you in the header.

## Priority rule

When multiple registered patterns could match a URL, **static segments beat parameterized segments** at the same position. For example, if both `/users/me` and `/users/:id` are registered, a request to `/users/me` matches `/users/me`.

## Example

```
Router r;
r.registerRoute("GET",    "/users/:id");
r.registerRoute("POST",   "/users");
r.registerRoute("GET",    "/users/me");     // static beats :id

r.match("GET",  "/users/me")   // pattern="/users/me",   params=[]
r.match("GET",  "/users/42")   // pattern="/users/:id",  params=[("id","42")]
r.match("POST", "/users")      // pattern="/users",      params=[]
r.match("DELETE", "/users/1")  // pattern="",            params=[] (not found)
```

## Constraints

- Methods and pattern/URL segments contain only uppercase letters, lowercase letters, digits, `-`, and `_`.
- At most 200 `registerRoute` calls.
- At most `10^4` `match` calls.
- Patterns and URLs have at most 10 segments.
- No duplicate registrations for the same method + pattern pair.
