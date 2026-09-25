## 2024-05-24 - Fix SSRF via Manual Redirect Following in API Enrichment

**Vulnerability:** Server-Side Request Forgery (SSRF) bypass in `api/enrich.ts` via unvalidated manual redirect following (`redirect: "manual"`).
**Learning:** Even if the initial URL is validated (or assumed safe), manually following redirects by extracting the `Location` header and making new `fetch` requests can allow an attacker to bypass initial checks. An attacker could provide a URL that initially points to a safe domain but redirects to an internal or malicious IP address.
**Prevention:** Strictly validate not only the initial input URL but also every subsequent URL extracted from the `Location` header against an allowlist of domains and protocols (e.g., using `new URL()` to check protocol and hostname). For Google domains, use strict regexes (`/^((www|maps|consent)\.)?google\.[a-z]{2,3}(\.[a-z]{2})?$/`) or exact matches (`maps.app.goo.gl`) instead of loose matching like `.startsWith()`.
