## 2024-11-21 - [CRITICAL] SSRF Vulnerability in Redirect Loops
**Vulnerability:** Server-Side Request Forgery (SSRF) risk in URL expansion logic (`api/enrich.ts`). The `expandUrl` function followed HTTP redirects indiscriminately up to 5 times. An attacker could provide a URL that initially points to a benign domain but redirects to an internal server or cloud metadata endpoint, bypassing initial checks if any existed.
**Learning:** For API endpoints dealing with URL redirect expansion, hostname validation checks must occur at *every* step of a redirect loop, not just before the initial outbound server `fetch` request.
**Prevention:** Implement strict hostname validation checks (e.g., whitelisting allowed domains) inside the loop for every redirected URL before fetching it.
