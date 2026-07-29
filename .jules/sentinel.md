## 2024-07-29 - Prevent SSRF in Maps Link Expansion and Stop Error Information Leakage
**Vulnerability:**
1. SSRF risk in `api/enrich.ts`'s `expandUrl` function, which iteratively fetched user-provided URLs in redirect loops without validating the hostnames.
2. Sensitive server/fetch error leakage via `String(e)` returned directly in 500 status code responses in the main `handler` try/catch block.

**Learning:**
1. An endpoint interacting with user-provided external URLs must defensively check not just the first URL but every subsequent URL navigated during redirect loops to avoid traversing to internal or unintended domains (Server-Side Request Forgery).
2. It's a common oversight to cast an exception object to a string and return it in an HTTP 500 response, which can expose server state, connection details, and stack traces to clients.

**Prevention:**
1. Maintain strict allowlists for acceptable hostnames and rigorously validate `new URL(current).hostname` before executing outbound requests via `fetch`.
2. Securely catch exceptions: log details to `console.error` for debugging but return an opaque generic string (e.g., `"An internal error occurred"`) to the client.