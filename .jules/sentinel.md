## 2024-05-30 - [Fix SSRF bypasses via open redirects in maps API enricher]
**Vulnerability:** Server-Side Request Forgery (SSRF) bypass through unchecked URL redirects in the `expandUrl` function in `api/enrich.ts`.
**Learning:** Manual redirect handling (`fetch` with `redirect: "manual"`) that iteratively follows `Location` headers without strict validation on EACH extracted URL allows attackers to bypass initial SSRF protections. A safe-looking initial URL could redirect to an internal or malicious domain.
**Prevention:** Always implement strict protocol (`http`/`https`) and hostname validation (exact match or strict regex, avoiding `.startsWith`) not just on the initial URL, but on every URL extracted from a `Location` header before making subsequent requests.
