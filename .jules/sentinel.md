## 2024-05-24 - SSRF vulnerability in manual redirect following
**Vulnerability:** The `/api/enrich` endpoint accepted user-provided URLs and fetched them using `redirect: "manual"`, then blindly extracted the `Location` header to follow redirects up to 5 times. This could allow an attacker to bypass naive input validation (if it were added only to the initial URL) by providing a link to an attacker-controlled server that redirects to a sensitive internal resource (e.g., `http://169.254.169.254/`).

**Learning:** When manually following redirects by reading the `Location` header, both the initial user input and every subsequent URL extracted from the `Location` header MUST be validated against the same strict allowlist of protocols and domains before making the next `fetch` request.

**Prevention:** Always validate URLs at each step of a redirect chain. Use the `URL` constructor to securely parse the URL to extract the protocol and hostname. Enforce `http:` or `https:` protocols and ensure the hostname matches exact expected domains or strict subdomain patterns (e.g., avoiding `.startsWith("google.")` which could match `google.attacker.com`).
