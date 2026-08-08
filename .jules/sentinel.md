## 2025-02-27 - Server-Side Request Forgery in URL Enrichment

**Vulnerability:** The `/api/enrich` endpoint blindly fetched user-provided Google Maps URLs and followed redirects using `expandUrl` without validating the scheme or hostname at each redirect step. This allowed for potential SSRF where an attacker could provide a link (e.g., pointing to internal services or using `file://` / `gopher://` schemas) that the server would fetch.

**Learning:** When fetching third-party URLs, even if the initial intent is to parse known formats (like Google Maps links), malicious input or redirects can weaponize the server to attack internal infrastructure or other external sites.

**Prevention:** Always implement explicit scheme validation (restricting to `http:` and `https:`) and strict hostname whitelisting (e.g., only allowing `maps.app.goo.gl` and `.google.com`) before making outbound server-side requests. Crucially, this validation must be applied to every URL retrieved in a redirect loop, not just the initial input.
