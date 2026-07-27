# Reusable Engineering Master Prompt: Production Express.js Rate-Limiting Middleware

*Copy and paste the prompt below into your AI assistant. Replace bracketed placeholders `[LIKE_THIS]` with your project's specific parameters.*

---

```markdown
### TASK: Express.js Rate-Limiting Middleware Generation

Write a production-ready Express.js (Node.js) middleware factory function `createRateLimiter(options)` that implements in-memory sliding-window rate limiting without external npm packages.

### ARCHITECTURAL REQUIREMENTS:
1. **IP Extraction Fallback:** Safely extract the client IP address from `req.headers['x-forwarded-for']`, `req.headers['x-real-ip']`, or `req.ip` to support reverse-proxy environments.
2. **Configurable Options:** Accept an options object with defaults:
   - `windowMs` (default: `[DEFAULT_WINDOW_MS = 60000]` ms)
   - `maxRequests` (default: `[DEFAULT_MAX_REQUESTS = 10]` requests per window)
3. **Memory Safety:** Include a background `setInterval` cleanup timer (using `.unref()`) that removes expired IP entries from the in-memory Map every window period to prevent Out-Of-Memory leaks.

### OUTPUT FORMAT & HTTP CONTRACT:
1. **RFC 6585 Headers:** On *every* response, set standard HTTP rate-limit headers:
   - `X-RateLimit-Limit`: Maximum allowed requests
   - `X-RateLimit-Remaining`: Requests remaining in current window
   - `X-RateLimit-Reset`: Unix timestamp (in seconds) when the window resets
2. **429 Response Schema:** When `maxRequests` is exceeded, set the `Retry-After` header (in seconds) and return HTTP status `429 Too Many Requests` with structured JSON:
   ```json
   {
     "error": "RATE_LIMIT_EXCEEDED",
     "message": "Too many requests from IP [IP_ADDRESS]. Please retry in [RETRY_SECONDS]s.",
     "retryAfterSeconds": 30
   }
   ```

### DELIVERABLE REQUIREMENTS:
1. Provide the complete ES6+ middleware file with JSDoc type annotations.
2. Provide an accompanying Jest + Supertest verification test file that asserts both a successful `200 OK` response (with `X-RateLimit-Remaining`) and a throttled `429 Too Many Requests` response (with `Retry-After`).
```
