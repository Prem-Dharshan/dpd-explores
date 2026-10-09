## 2025-02-14 - SSRF in manual redirect expansion
**Vulnerability:** Server-Side Request Forgery (SSRF) due to unvalidated manual redirects. When expanding Google Maps URLs (e.g. `maps.app.goo.gl`), the server was following redirects specified in the `Location` header without validating the new URL.
**Learning:** Even if the initial URL is validated or expected to be safe, malicious servers can redirect to internal IPs or sensitive internal services. It's crucial to validate every single URL in the redirect chain.
**Prevention:** Always implement explicit protocol validation (allow only `http:` and `https:`) and strict hostname validation checks (using regex or exact matches) for every URL before making the fetch call, especially when following redirects manually.
