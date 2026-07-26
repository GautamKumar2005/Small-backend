# Capstone Technical Report: Embeddable Widget & Lead-Capture Platform

**Track:** Backend AI Engineering — Week 9 Capstone  
**Location:** `C:\Users\gauta\Newproject\small-backend\Script`  
**Repository:** https://github.com/GautamKumar2005/Small-backend/tree/main/Script  

---

## 1. Executive Summary

This report documents the architectural design, security hardening, and implementation of the **Embeddable Widget & Lead-Capture Platform** built for the Week 9 Capstone of the Backend AI Engineering curriculum. The platform enables customers to define lead-capture widgets (popovers, signup forms, CTAs) via an authenticated Admin API, generate a one-line `<script>` tag, and embed it across any external website origin.

Because the submission endpoints are directly exposed to untrusted browsers across the public internet, the platform incorporates defense-in-depth security measures: strict CORS boundary enforcement, boundary payload size checks (`413 Payload Too Large`), honest schema validation (`400 Bad Request`), multi-layer spam trapping (`422 Unprocessable Entity`), burst rate limiting (`429 Too Many Requests`), a 3-provider IP→Geo enrichment fallback chain, and asynchronous side-effect error isolation.

---

## 2. Core Architectural Components

### A. Admin & Tenant-Isolated Management (`/api/admin/*`)
- **Widget Repository (`widget.repository.js`):** Provides tenant-isolated CRUD operations with JSON file persistence (`data/widgets.json`) and version tracking.
- **Snippet Generation:** Automatically produces the embed snippet:
  ```html
  <script src="http://localhost:3000/cdn/widget.js" data-widget-id="wdg-demo-123" async defer></script>
  ```
- **Analytics Aggregation:** Computes live metrics including Total Submissions, Valid Leads, Spam Blocked, Conversion Rate, Geo Location Breakdown, and Enrichment Provider Failover distribution.

### B. CDN Asset & Config Delivery (`/cdn/widget.js` & `/api/widgets/:id/config`)
- **Static Asset Serving:** Serves `widget.js` with CDN-style cache control (`Cache-Control: public, max-age=3600, stale-while-revalidate=86400`).
- **Cached Config Endpoint:** Config responses compute an `ETag` hash based on widget version. When an external browser sends `If-None-Match`, the endpoint responds with `304 Not Modified`, minimizing payload bandwidth.

### C. Hardened Public Submission Endpoint (`POST /api/widgets/:id/submissions`)
1. **CORS Boundary Hardening (`cors.middleware.js`):** Intercepts `OPTIONS` preflight requests, responding immediately with `204 No Content`, allowed origins (`*` or requesting origin), and permitted methods/headers.
2. **Payload Validation (`validate.middleware.js` & `server.js`):** Enforces a strict `10 KB` Content-Length boundary limit before body parsing. Checks email syntax and JSON structure, returning honest status codes (`400 Bad Request` or `413 Payload Too Large`).
3. **Abuse & Spam Resistance (`spam.service.js` & `rateLimit.middleware.js`):**
   - **Honeypot Trap:** Inspects hidden form field `_hp_trap`.
   - **Timing Heuristic:** Rejects submissions completed faster than `1.2 seconds` after widget rendering.
   - **Burst Rate Limiting:** Limits requests per `IP + Widget ID` pair to `10 requests/minute`. When exceeded, returns HTTP `429 Too Many Requests` with a `Retry-After` header.
4. **Enrichment Fallback Chain (`enrichment.service.js`):**
   - Implements FlyRank's 3-provider sequential fallback pattern: `mock-geo-primary` → `mock-geo-secondary` → `mock-geo-fallback`.
   - Includes an administrative toggle (`POST /api/admin/geo-toggle`) so that `mock-geo-primary` can be deterministically disabled, proving that `mock-geo-secondary` seamlessly enriches the lead without failing the request.
5. **Safe Side-Effect Decoupling (`webhook.service.js`):**
   - Simulates sending a confirmation email and webhook notification to the widget owner.
   - Wrapped in asynchronous error isolation so that an upstream email/webhook service failure logs a warning but never fails the visitor's lead capture (`HTTP 201 Created`).

---

## 3. Implementation Workflow & Milestones Achieved

- **Milestone 1 (Design & Storage):** Established tenant-isolated repositories for widgets and submissions with disk persistence.
- **Milestone 2 (Admin CRUD & Snippet):** Built `/api/admin/widgets` endpoints with JWT authentication and snippet generator.
- **Milestone 3 (Public CORS Endpoint & Enrichment Chain):** Created `/api/widgets/:id/submissions` with CORS preflight, 3-provider Geo failover, and decoupled safe side-effects.
- **Milestone 4 (Abuse Resistance):** Added burst rate limiting (`429`), honeypot spam filter (`422`), and boundary payload size limits (`413`).
- **Milestone 5 (Frontend Dashboards & Demo Origin):** Developed the interactive Owner Dashboard (`public/dashboard.html`) with an Attack Simulation Panel and set up a second local server (`port 3001`) hosting an authentic cross-origin customer blog (`public/customer-site.html`).
- **Milestone 6 (Automated Verification):** Built a self-contained test suite (`tests/capstone.test.js`) achieving 100% pass rate across 10 test cases.

---

## 4. Automated Verification Results

The automated test suite (`npm test`) verifies all deliverables:

```
================================================================
  Test Summary: 10 PASSED | 0 FAILED
================================================================
```

| Test Case | Description | Status | Status Code Verified |
| :--- | :--- | :---: | :---: |
| **1. Cache-Control & ETag** | Verify `GET /api/widgets/:id/config` returns cache headers | **PASS** | HTTP `200 OK` |
| **2. 304 Not Modified** | Verify `If-None-Match` matching ETag returns not modified | **PASS** | HTTP `304 Not Modified` |
| **3. CORS Preflight** | Verify `OPTIONS /api/widgets/:id/submissions` headers | **PASS** | HTTP `204 No Content` |
| **4. Malformed Payload** | Verify empty/invalid JSON is rejected | **PASS** | HTTP `400 Bad Request` |
| **5. Oversized Payload** | Verify payload `> 10 KB` is rejected | **PASS** | HTTP `413 Payload Too Large` |
| **6. Primary Geo Enrichment** | Verify primary provider enrichment on clean lead | **PASS** | HTTP `201 Created` (`mock-geo-primary`) |
| **7. Geo Fallback Chain** | Verify failover to secondary provider when primary is DOWN | **PASS** | HTTP `201 Created` (`mock-geo-secondary`) |
| **8. Safe Side Effects** | Verify email/webhook failure never fails submission | **PASS** | HTTP `201 Created` |
| **9. Honeypot Spam Filter** | Verify bot filling hidden `_hp_trap` is blocked | **PASS** | HTTP `422 Unprocessable Entity` |
| **10. Burst Rate Limiting** | Verify 12 rapid submissions trigger rate limit | **PASS** | HTTP `429 Too Many Requests` |

---

## 5. Conclusion

The **Embeddable Widget & Lead-Capture Platform** is fully hardened, tested, and ready for production deployment across untrusted external website origins.
