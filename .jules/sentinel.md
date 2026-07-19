## 2025-02-28 - SSRF vulnerability during URL Expansion
**Vulnerability:** The `/api/enrich` endpoint blindly fetched user-provided URLs up to 5 times (following redirects) without validating the target hostname or protocol, enabling Server-Side Request Forgery (SSRF).
**Learning:** Redirect loops are a common vector for SSRF. Even if the initial user-provided URL looks benign, it can redirect the server's `fetch` request to an internal metadata IP (e.g., `169.254.169.254`), internal network services, or alternative protocols (`http:`, `file:`, etc.).
**Prevention:** Always parse, validate, and whitelist both the protocol (e.g., `https:`) and the hostname at *every hop* of a manual redirect chain before performing the outbound network request.
