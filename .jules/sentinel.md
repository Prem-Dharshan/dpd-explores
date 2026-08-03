## 2025-01-08 - SSRF in Redirect Loop
**Vulnerability:** The `expandUrl` function in `api/enrich.ts` followed redirects without validating the destination host or protocol, allowing a Server-Side Request Forgery (SSRF) attack via arbitrary redirect chains.
**Learning:** Redirect loops must validate both protocol and host *before* every outbound request, not just the initial input URL.
**Prevention:** Implement strict URL parsing and validate protocol (e.g., `https:`) and host against an allowlist before each `fetch` in a redirect-following loop.