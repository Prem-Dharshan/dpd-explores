## 2024-05-18 - Prevent Server-Side Request Forgery in Google Maps URL Enrichment

**Vulnerability:** The `/api/enrich` endpoint accepted raw, unvalidated Google Maps URLs from user input and blindly fetched them to resolve redirects (`maps.app.goo.gl` short links).
**Learning:** This could be exploited by providing an arbitrary URL that redirects to internal Vercel metadata APIs or internal network services, leading to a Server-Side Request Forgery (SSRF) vulnerability. The endpoint also improperly leaked error stack traces in `catch` blocks.
**Prevention:** Always parse and validate user-provided URLs before issuing backend `fetch` requests. Ensure protocols are strictly `http/https`, and hostnames are aggressively validated against allowed domains (like exact matches for `maps.app.goo.gl` and regex matches for regional `google.com` variants). Additionally, catch blocks should return generic `500` error strings rather than exposing stack details.
