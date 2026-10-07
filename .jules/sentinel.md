## 2024-05-24 - Fix SSRF Vulnerability in URL Expansion
**Vulnerability:** The `/api/enrich` endpoint accepted a URL, expanded it using a manual fetch loop following redirects, but did not validate the original or redirected URLs, allowing Server-Side Request Forgery (SSRF) attacks against internal endpoints.
**Learning:** Manual URL redirection logic is a critical point for SSRF vulnerabilities because an attacker can use an allowed short URL service that later redirects to internal/malicious network locations.
**Prevention:** Always implement strict URL validation (checking protocols and using precise hostname regex) before requesting any user-provided URL or following any redirects within backend processes.
