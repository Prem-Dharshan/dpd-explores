## 2024-05-14 - SSRF in Maps Enrichment
**Vulnerability:** The `/api/enrich` endpoint blindly fetched user-provided URLs in `expandUrl` and followed redirects without domain or protocol validation, allowing Server-Side Request Forgery (SSRF).
**Learning:** Even URLs meant to be Google Maps links must be strictly validated before being passed to `fetch()`, both initially and when following redirects (`Location` header).
**Prevention:** Always use `URL` parser to validate protocol (`http:`/`https:`) and strictly match hostnames against a known allowlist (e.g. `maps.app.goo.gl`, `*.google.com`, regional domains) before making server-side requests.
