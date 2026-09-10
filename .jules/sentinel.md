## 2024-05-24 - [Fix SSRF and Data Leaking in enrich API]
**Vulnerability:** The API endpoint `api/enrich.ts` accepted an external user-provided URL and followed redirects blindly, allowing potential Server-Side Request Forgery (SSRF). Additionally, it leaked internal error stack traces in its generic catch block.
**Learning:** Even internal API wrappers must carefully validate and sanitize externally provided inputs, especially when calling `fetch`. Broad exception handling should never expose internals like `String(e)` to the client response.
**Prevention:** Always whitelist domains and protocols explicitly using regex or strict equality checks for any external URL parameter, including those retrieved via manual redirects. Implement generic failure responses for internal errors.
