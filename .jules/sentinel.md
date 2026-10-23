## 2024-10-24 - SSRF in URL Expansion
**Vulnerability:** The /api/enrich endpoint manually followed user-provided URLs in `expandUrl` without validating the host or protocol, allowing Server-Side Request Forgery (SSRF) where attackers could fetch internal endpoints (e.g., http://localhost, http://169.254.169.254).
**Learning:** Manual redirect following via `fetch` with `redirect: "manual"` bypasses browser/fetch protections for subsequent URLs. It's critical to validate both the initial user input AND every subsequent URL retrieved from the `Location` header.
**Prevention:** Implement strict URL parsing (`new URL()`), explicitly allowlist only `http:` and `https:` protocols, and use strict hostname matching (avoiding naive `.startsWith()` or `.includes()`) before every outbound request.
