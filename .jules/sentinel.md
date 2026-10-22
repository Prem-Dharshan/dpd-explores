## 2023-10-23 - Prevent SSRF via Redirect Following
**Vulnerability:** `expandUrl` in `api/enrich.ts` followed redirects manually without validating the hostname of the URL or the location header, which could allow a malicious URL to point the server to a protected internal service (Server-Side Request Forgery).
**Learning:** Even if an initial URL is validated or benign, when manual redirect resolution (`redirect: "manual"`) is employed, every intermediate URL extracted from `location` headers must be validated against a strict allowlist.
**Prevention:** Always parse URLs with `new URL()` to correctly extract protocols and hostnames, validating against an allowed list of domains (e.g., specific Google Maps domains) before making outbound server-side requests.
