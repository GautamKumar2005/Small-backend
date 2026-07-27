# Prompt Ladder: One-Layer-at-a-Time Audit (FL-07)
**Author:** Gautam Kumar | **Track:** AI Fluency Week 07 | **Date:** July 2026  
**Workspace Location:** `C:\Users\gauta\Newproject\small-backend\ladder`

---

## 1. Executive Summary & Methodology
This audit demonstrates how adding **one prompt layer at a time** transforms an embarrassing baseline prompt into a production-ready engineering specification across 6 runs.
Crucially, **Run 3 (Version 3)** documents an honest **"this made it worse"** moment where an arbitrary line-count constraint introduced a severe memory leak, proving that over-constraining prompt length degrades production reliability.

---

## 2. Side-by-Side Prompt Ladder Table (6 Runs)

| Run # | Version / Layer Added | Prompt Excerpt / Key Change | What Improved in the Output (The Result) | What Still Failed / Degraded |
|:---:|---|---|---|---|
| **0** | **Baseline**<br/>*(Weak)* | `"Write backend code for rate limiting."` | N/A — Guessed Python/Flask instead of Node.js/Express. | Wrong language, hardcoded 10 req limit, no HTTP headers, no middleware separation. |
| **1** | **V1: Clearer Goal & Stack Context** | `"Write an Express.js (Node.js) middleware function for rate limiting that protects a public POST route."` | Stopped generating Python/Flask; produced valid Node.js/Express syntax with standard middleware signature. | Lazily used external npm package (`express-rate-limit`); 15-minute window didn't fit burst traffic. |
| **2** | **V2: Real Context & Proxy Headers** | Added in-memory Map requirement (10 req/60s) & proxy IP fallback (`x-forwarded-for`, `x-real-ip`). | Eliminated third-party npm dependency; correctly extracted proxy client IPs; implemented sliding counter. | Returned plain text string (`'Rate limit exceeded'`); zero RFC headers; no memory cleanup. |
| **3** | **V3: Strict Line Count Trap**<br/>*(Made it Worse!)* | `"Keep the code strictly under 25 lines total and do not use helper functions or background intervals."` | Reduced line count to 11 lines and switched to basic `.json({ error: "..." })` response. | **MADE IT WORSE:** Created infinite Map memory leak (OOM crash risk), unreadable variable names (`m`, `r`, `c`), zero observability. |
| **4** | **V4: Output Format & RFC Headers** | Removed brevity trap; added RFC 6585 headers (`Retry-After`, `Limit`, `Remaining`, `Reset`), structured 429 JSON, and `.unref()` interval timer. | Eliminated V3 memory leak with automatic Map eviction; added RFC observability headers & clean JSON schema. | Lacked JSDoc type annotations; no verification test suite example; hardcoded config options. |
| **5** | **V5: Few-Shot Examples & Test Spec** | Added inline JSDoc export signature pattern & Jest/Supertest unit test verification requirements. | **Gold Standard:** Generated modular factory function (`createRateLimiter`), JSDoc headers, and full Jest verification test suite. | None — 100% testable, memory-safe, and production-ready. |

---

## 3. Four Audit Notes per Version (What Actually Improved)

### Version 1 (Clearer Goal & Stack Context)
* **Prompt Change:** Specified `Express.js (Node.js)` and middleware functional goal.
* **What Improved in Output:** Eliminated Python/Flask hallucinations; generated idiomatic Express syntax.
* **What Still Failed:** Relied on `express-rate-limit` npm package instead of custom logic.
* **Next Try:** Add real architecture context and proxy IP header extraction.

### Version 2 (Real Context & Proxy Headers)
* **Prompt Change:** Required zero third-party packages, 10 req/60s, and `x-forwarded-for` fallback.
* **What Improved in Output:** Wrote custom Map-based counter and handled multi-hop proxy IP headers correctly.
* **What Still Failed:** Sent plain text errors; omitted `Retry-After` header; Map grew infinitely without cleanup.
* **Next Try:** Add strict brevity constraint (<25 lines) to simplify code.

### Version 3 (Line Count Constraint — *THE "MADE IT WORSE" MOMENT*)
* **Prompt Change:** Added negative constraint: `"Keep code strictly under 25 lines; no helper functions/intervals."`
* **What Improved in Output:** Code shrunk to 11 lines; used JSON error body.
* **What Still Failed (Why It Got Worse):** Forbidding background intervals caused **infinite Map memory leaks (OOM risk)**; variable names became unreadable (`m`, `r`); zero RFC headers.
* **Next Try:** Discard line count constraint; specify explicit RFC 6585 headers and automatic Map eviction.

### Version 4 (Output Format & RFC 6585 Headers)
* **Prompt Change:** Required RFC headers (`X-RateLimit-*`, `Retry-After`), JSON error body, and `.unref()` cleanup timer.
* **What Improved in Output:** Fixed memory leak with 5-min periodic cleanup; added complete RFC observability headers and precise retry timestamps.
* **What Still Failed:** Code was hardcoded for one route; lacked verification unit tests.
* **Next Try:** Provide few-shot factory patterns and Jest/Supertest verification spec.

### Version 5 (Few-Shot Examples & Test Spec)
* **Prompt Change:** Added JSDoc factory signature example and Supertest assertion requirements.
* **What Improved in Output:** Produced configurable factory function `createRateLimiter(opts)` and an automated Jest verification suite proving 200/429 status transitions.
* **What Still Failed:** None — fully verified and production-grade.
* **Next Try:** Format as a standalone Reusable Master Prompt.

---

## 4. Reusable Engineering Master Prompt
```markdown
### TASK
Write a production-ready Express.js rate-limiting middleware factory `createRateLimiter(opts)` implementing an in-memory sliding window without npm packages.

### ARCHITECTURAL REQUIREMENTS
1. **Proxy IP Fallback:** Extract client IP from `req.headers['x-forwarded-for']`, `x-real-ip`, or `req.ip`.
2. **Configurable Options:** Accept `{ windowMs = 60000, maxRequests = 10 }`.
3. **Memory Safety:** Include a `setInterval` timer (using `.unref()`) to delete expired IP entries every window period.

### OUTPUT & RFC HEADER CONTRACT
1. On every response, set: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` (Unix sec).
2. When limited, set `Retry-After` (seconds) and return HTTP `429 Too Many Requests` with JSON:
   `{ "error": "RATE_LIMIT_EXCEEDED", "message": "...", "retryAfterSeconds": N }`

### DELIVERABLES
1. Complete ES6+ middleware file with JSDoc headers.
2. A Jest/Supertest verification test suite asserting 200 OK (with remaining header) and 429 Too Many Requests (with Retry-After).
```
