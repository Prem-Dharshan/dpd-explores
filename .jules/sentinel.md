## 2025-02-23 - Prevent SSRF in redirect expansion
**Vulnerability:** The `/api/enrich` endpoint accepted arbitrary URLs and followed their redirects using `fetch(..., { redirect: "manual" })`, allowing Server-Side Request Forgery (SSRF) against internal services (e.g., `http://169.254.169.254` or `file:///`).
**Learning:** URL redirect expansion features are inherently dangerous if the input URL is not strictly validated against an allowlist of protocols and hostnames before the first fetch is initiated.
**Prevention:** Always validate both the protocol (allowing only `http:`/`https:`) and the hostname (using strict exact matches or safe suffix/regex matching, e.g., avoiding `.startsWith("google.")`) before attempting to fetch or expand user-provided URLs.
