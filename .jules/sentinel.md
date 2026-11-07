## 2024-05-18 - SSRF through Open Redirects
**Vulnerability:** The API endpoint `/api/enrich` followed manual redirects without re-validating the `Location` header URL. An attacker could use a legitimate, allowlisted service (like a Google Maps open redirect) to bounce the request to an internal network IP (SSRF) bypassing the initial domain check.
**Learning:** Checking the initial URL against an allowlist is not enough when manually following redirects with `fetch`. The target of every single redirect must be strictly validated before issuing the next fetch.
**Prevention:** Implement a strict URL validation function (e.g. `isValidGoogleMapsUrl`) using `new URL()` and apply it to both the initial input URL and every URL extracted from a `Location` header in a redirect loop.
