## 2024-05-24 - [CRITICAL] Prevent SSRF Vulnerability in Link Expander

**Vulnerability:** The `/api/enrich` endpoint accepted arbitrary user-provided URLs for link expansion. The `expandUrl` function iteratively performed `fetch` requests following the `Location` header without checking the hostname. This is a Server-Side Request Forgery (SSRF) vulnerability. An attacker could pass URLs resolving to internal IP addresses or sensitive local services, which the server would blindly call. Additionally, the error handler used `String(e)` which could leak the stack trace or sensitive info on errors.

**Learning:** When fetching URLs provided by the user, validation must happen iteratively at every step of a redirect chain, not just the initial request, to prevent SSRF vulnerabilities bypassing initial validation. Also, error handling in catch blocks must securely fail by returning generic error messages.

**Prevention:** Maintain a strict whitelist of allowed domains and check the hostname against this whitelist before performing *any* outgoing request (including each redirect hop). Furthermore, ensure global catch blocks return a secure, generic 500 error instead of leaking internal errors.
