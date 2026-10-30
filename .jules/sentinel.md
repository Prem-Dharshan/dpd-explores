## 2024-10-31 - URL Redirect SSRF Bypass
**Vulnerability:** The `/api/enrich` endpoint was manually following redirects from a user-provided URL using `fetch(url, { redirect: "manual" })`. It read the `Location` header to follow shortlinks but didn't validate the destination URLs, allowing an attacker to bypass domain restrictions if the initial Google URL redirected to a malicious internal IP (SSRF).
**Learning:** Even if an initial URL is validated, following redirects manually requires re-validating every step of the redirect chain. A safe domain can redirect to an unsafe domain.
**Prevention:** Always validate every URL extracted from the `Location` header during manual redirects against an allowlist of domains and protocols, using `new URL()` to parse it properly.
