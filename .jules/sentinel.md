## 2026-07-26 - [Fix SSRF vulnerability in Google Maps enrichment]
**Vulnerability:** Server-Side Request Forgery (SSRF) risk in URL expansion logic in `/api/enrich`
**Learning:** The URL expander would blindly follow any client-provided URL redirects without verifying that the hostname belongs to an expected and trusted domain, potentially enabling SSRF if a malicious payload is supplied.
**Prevention:** Always implement strict hostname validation (an allowlist of authorized domains) for any URLs being fetched or followed by the server.
