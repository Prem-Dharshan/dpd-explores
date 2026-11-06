## 2024-11-06 - Strict Protocol and Domain Validation for SSRF

**Vulnerability:**
The endpoint `/api/enrich` accepted a `url` parameter and followed arbitrary HTTP redirects up to 5 times using `fetch` with `redirect: "manual"`. Because the input URL and extracted `Location` header URLs were not validated, an attacker could supply a URL that ultimately redirects to an internal network address or unauthorized domain, triggering an SSRF.

**Learning:**
When manually following URL redirects, it's not enough to validate just the initial URL. A seemingly safe domain can respond with a `Location` header pointing to a malicious/internal IP. Both the initial input URL and every subsequent URL extracted from the `Location` header must be strictly validated against an allowlist of domains and protocols.

**Prevention:**
Always implement strict protocol validation (e.g., `http:` and `https:`) and hostname whitelisting (using exact matches, strict subdomain checks like `.endsWith`, or precise regexes) on any user-supplied or redirect-extracted URL before making requests. Avoid naive string matching (e.g., `startsWith`).
