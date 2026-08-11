## 2025-02-14 - Prevent SSRF in Server-Side Fetch Loops

**Vulnerability:** The `/api/enrich` Vercel Serverless function implemented a loop to follow `location` headers manually via `fetch` to expand shortened Google Maps URLs (`goo.gl`). The server explicitly extracted the `location` header string and performed an outbound `fetch` on it without any protocol or domain validation. An attacker could provide a malicious URL (or a short link that redirects to one) pointing to internal network addresses (e.g., AWS metadata endpoint `http://169.254.169.254/` or internal database servers), leading to a critical Server-Side Request Forgery (SSRF).

**Learning:** When writing manual redirect-following logic (e.g., `redirect: 'manual'` with `fetch`), checking the initial input URL is insufficient. The `location` header returned by the remote server is completely untrusted user data. A seemingly safe domain like `goo.gl` can redirect to `http://localhost/`.

**Prevention:** Always implement strict protocol checking (`http:` or `https:`) and tight domain whitelisting (e.g., `google.com` or `goo.gl`) *inside* the redirect loop, right before every outbound request. Never rely on the initial input URL's safety when following redirects manually.
