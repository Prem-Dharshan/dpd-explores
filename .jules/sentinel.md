## 2024-10-24 - API Redirect Validation Missing

**Vulnerability:** The `/api/enrich` endpoint accepted user-provided URLs and followed `Location` headers up to 5 times without re-validating the resulting URLs against an allowlist, making it vulnerable to Server-Side Request Forgery (SSRF).

**Learning:** When using `redirect: "manual"` to follow redirects manually in Node.js (Vercel Serverless), every step of the redirect chain must be explicitly validated against a strict domain and protocol allowlist. Relying solely on validating the initial URL is insufficient because a benign initial URL can redirect to a malicious internal IP or unauthorized domain. Additionally, regex validations for domains (e.g., Google regional domains) must be correctly anchored and constructed to prevent bypasses like `google.com.evil.com`.

**Prevention:** Implement a strict URL validation function (e.g., checking for `http:`/`https:` protocols, exact matches for domains, and strictly anchored regexes for regional variations) and invoke it immediately before *every* `fetch` call within a redirect loop, not just before the first one.
