## 2025-02-23 - Prevent SSRF in manual redirect expansion
**Vulnerability:** Server-Side Request Forgery (SSRF) bypass through manual URL redirect following in `fetch` calls. A safe-looking initial URL could redirect to an internal IP or malicious domain.
**Learning:** When implementing manual redirect handling (`redirect: "manual"`), validating only the initial input URL is insufficient. Every subsequent URL extracted from the `Location` header must also be strictly validated against an allowlist of domains and protocols.
**Prevention:** Always implement strict protocol (`http:`/`https:`) and hostname validation (using exact matches or precise regexes) inside the redirect loop before making the next `fetch` request.
