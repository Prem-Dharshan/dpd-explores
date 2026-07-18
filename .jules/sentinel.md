
## 2024-05-18 - Prevent Server-Side Request Forgery (SSRF) in fetch redirect loops
**Vulnerability:** The `expandUrl` function in `api/enrich.ts` followed redirects based on user-provided input blindly without validating the target domain. This allowed an attacker to supply a URL that redirects to internal network addresses or unauthorized services (SSRF).
**Learning:** Even when building a feature designed to follow short links (like `maps.app.goo.gl`), we must validate the URL host at every step of the redirect loop to prevent the final request from targeting a sensitive internal resource.
**Prevention:** Always implement strict hostname validation checks (e.g., an allowed domain whitelist) before making outbound server `fetch` requests, and check the target domain on each redirect hop.
