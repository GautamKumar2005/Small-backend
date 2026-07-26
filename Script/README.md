# Embeddable Widget & Lead-Capture Platform (Week 9 Capstone)

**Track:** Backend AI Engineering — Week 9 Capstone (`small-backend/Script`)  
**Workload:** 32h  

---

## 1. Overview & Objectives

This capstone builds a production-grade, multi-origin **Embeddable Widget & Lead-Capture Platform**. Unlike typical backend APIs where only trusted clients communicate with your server, this platform's primary input surface is the **public internet**: external websites embedding a one-line `<script>` tag across arbitrary origins.

### Core Deliverables Built:
1. **Admin API (Authenticated & Tenant-Isolated):** CRUD widgets, generate a one-line `<script>` embed snippet, and retrieve aggregated analytics.
2. **CDN Config & Asset Delivery:** Public endpoint (`/cdn/widget.js` & `/api/widgets/:id/config`) serving minified script assets and JSON config with proper cache headers (`Cache-Control: public, max-age=3600`, ETag, `304 Not Modified`).
3. **Public Lead-Capture Submission Endpoint:** Hardened public boundary (`POST /api/widgets/:id/submissions`) with strict CORS preflight handling (`OPTIONS`), Content-Length boundary checks (`413 Payload Too Large`), and honest schema validation (`400 Bad Request`).
4. **Enrichment with a 3-Provider Fallback Chain:** Resolves visitor IP addresses to geographic locations trying multiple providers in order (`mock-geo-primary` → `mock-geo-secondary` → `mock-geo-fallback`). If any provider fails, it degrades gracefully to the next provider without failing the submission.
5. **Abuse Resistance:** Protects against spam and DoS attacks using an automated honeypot trap (`_hp_trap`), submission speed heuristic (`< 1.2s`), and a sliding-window burst rate limiter (`429 Too Many Requests` with `Retry-After`).
6. **Safe Side-Effect Decoupling:** Simulates confirmation email / webhook notifications wrapped in async error isolation so that an upstream SMTP/webhook failure never fails the visitor's lead submission (`201 Created`).
7. **Interactive Owner Dashboard & Attack Demo Panel:** Premium dark-mode UI with live stats, lead table, and interactive attack buttons to test CORS, burst rate limits, spam rejection, and geo failover live.
8. **Automated Test Suite:** Self-contained Node.js test script (`npm test`) verifying all 10 core capstone scenarios with 100% pass rate.

---

## 2. Architecture Diagram

```
 owner (authed) ──► POST /api/admin/widgets ──► Widget Repo (tenant-isolated) ──► generate <script src=".../cdn/widget.js">

 customer site  ──<script src=cdn/widget.js>──► GET /api/widgets/:id/config (cached, CORS, ETag) ──► Render Modal CTA

 visitor lead   ──CORS POST /submissions──► Validate (400/413) ──► Rate-Limit (429) & Spam Trap (422) 
                                                      │
                                                      ▼
                                            Enrich (IP → Geo Chain)
                                            ┌─────────────────────────┐
                                            │ 1. mock-geo-primary     │
                                            │    ▼ (on failure/down)  │
                                            │ 2. mock-geo-secondary   │
                                            │    ▼ (on failure/down)  │
                                            │ 3. mock-geo-fallback    │
                                            └────────────┬────────────┘
                                                         │
                                                         ▼
                                                Save Lead Submission
                                                         │
                                                         ▼
                                          Safe Side Effect (Email / Webhook)
                                            [Never fails HTTP request]
                                                         │
                                                         ▼
                                            HTTP 201 Created Response

 owner dashboard (authed) ◄── GET /api/admin/submissions & /stats ◄── View Leads & Spam Blocked
```

---

## 3. Security Hardening & Abuse Controls

1. **CORS Boundary Protection:**
   - Preflight `OPTIONS` requests are handled immediately with `204 No Content`.
   - Explicit headers: `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, and `Access-Control-Allow-Headers`.
2. **Boundary Size & Syntax Validation:**
   - Global Content-Length check immediately rejects payloads `> 10 KB` with HTTP `413 Payload Too Large`.
   - Malformed JSON syntax is caught and returned as HTTP `400 Bad Request`.
3. **Burst Rate Limiter:**
   - Evaluates request velocity per `IP + Widget ID` pair.
   - Bursts exceeding `10 requests/minute` return HTTP `429 Too Many Requests` with a `Retry-After` header.
4. **Honeypot & Timing Spam Filters:**
   - Hidden form field `_hp_trap` catches bots filling out every input field.
   - Timing token `_render_ts` detects bots submitting faster than humanly possible (`< 1.2 seconds`).
   - Flagged spam returns `422 Unprocessable Entity` and increments the dashboard's "Spam Blocked" counter.

---

## 4. How to Run Locally & Execute Demo

### 1. Install Dependencies & Start Server
```bash
npm install
npm start
```
This launches two servers:
- **Primary Platform & CDN Origin:** `http://localhost:3000`
- **Demo Customer Site (Separate Origin):** `http://localhost:3001`

### 2. View Interactive Owner Dashboard
Open [http://localhost:3000/dashboard.html](http://localhost:3000/dashboard.html) in your browser.
- Create new widgets, copy embed code snippets, and monitor real-time lead submissions and conversion rates.

### 3. Test Cross-Origin Lead Capture
Open the simulated customer blog at [http://localhost:3001/customer-site.html](http://localhost:3001/customer-site.html).
- The page is served from port `3001` while loading `<script src="http://localhost:3000/cdn/widget.js">`.
- Submit your details in the bottom-right popover widget and watch it land in the dashboard with IP→Geo enrichment!

### 4. Attack & Resilience Testing Panel
In the Owner Dashboard ([http://localhost:3000/dashboard.html](http://localhost:3000/dashboard.html)), use the **Resilience & Attack Demo** panel:
- **Test Cross-Origin CORS:** Validates preflight headers.
- **Trigger Rate-Limit Burst:** Rapidly sends 12 POST requests to trigger HTTP `429 Too Many Requests`.
- **Send Bot Spam (Honeypot):** Submits hidden honeypot trap to trigger HTTP `422 Unprocessable Entity`.
- **Toggle Primary Geo Provider DOWN:** Turn off `mock-geo-primary` and submit a lead; watch it seamlessly failover to `mock-geo-secondary` without errors.

---

## 5. Automated Tests

To run the full automated test suite (verifying CORS, validation, rate limiting, geo fallback, and side-effect safety):

```bash
npm test
```

**Expected Test Output:**
```
================================================================
  Test Summary: 10 PASSED | 0 FAILED
================================================================
```
