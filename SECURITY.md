# Security Policy

## Reporting a Vulnerability

Please **do not** open a public GitHub issue for security vulnerabilities.

Instead, email a description of the issue to the repository owner. Include:

- A description of the vulnerability and its potential impact
- Steps to reproduce or proof-of-concept code
- Any suggested mitigations

You will receive a response within 72 hours. If the issue is confirmed, a fix will be prioritised and a public advisory will be published once the patch is released.

## Scope

The following are in scope:

- Authentication and authorisation bypass
- Code execution escaping the Docker sandbox
- Data exposure (other users' submissions, test cases, or personal data)
- SQL injection or other injection attacks against the API

The following are **out of scope**:

- Denial-of-service attacks
- Issues requiring physical access to the server
- Social engineering
