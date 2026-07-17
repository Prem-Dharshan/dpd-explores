## 2025-05-18 - [Fix SSRF vulnerability during URL Expansion]
**Vulnerability:** A Server-Side Request Forgery (SSRF) was possible via the `url` parameter in `/api/enrich` endpoints. The server fetched user-provided links to resolve redirects without validating the target domains, enabling attackers to scan internal networks or query sensitive metadata services.
**Learning:** URL redirect expansion features must validate both the initial URL and all subsequent `location` headers against a strict whitelist of expected hostnames (e.g., `maps.app.goo.gl`, `maps.google.com`).
**Prevention:** Implement a strict URL hostname validation check (`isValidGoogleMapsUrl`) before making outbound server requests and during redirect loops in APIs that fetch user-supplied URLs.
