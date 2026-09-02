## 2024-05-18 - [CRITICAL] Fix SSRF vulnerability in URL expansion
**Vulnerability:** `api/enrich.ts` followed HTTP redirects without validating the URLs, which could allow a malicious user to bypass security controls by providing a URL that redirects to an internal system (Server-Side Request Forgery). Error messages also leaked system details by using `String(e)`.
**Learning:** We need to explicitly validate every single URL in a redirect chain, not just the initial input URL.
**Prevention:** Always implement explicit protocol and strict hostname validation against allowlists for URLs that are fetched server-side.
