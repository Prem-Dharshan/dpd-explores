## 2024-05-18 - Prevent SSRF via Redirect Loops and Secure Error Responses
**Vulnerability:**
The `/api/enrich` endpoint expanded URLs recursively without strict domain checking, posing an SSRF risk if a user-supplied URL returned redirects to internal or untrusted infrastructure. Additionally, raw error messages were being leaked in the 500 response on failure.
**Learning:**
URL expansions must strictly validate hostnames on *every* redirect step, not just the initial input, to prevent an attacker from bypassing domain checks via an intermediate redirect. Furthermore, error handling in API catch blocks must return generic error messages to avoid leaking implementation details.
**Prevention:**
Enforce whitelist checks for expected hostnames (e.g., `isAllowedGoogleDomain`) in loop logic for any fetch requests that resolve redirects, and map backend exceptions to static fallback strings for API consumers.
