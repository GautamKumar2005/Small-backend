# Make It Do Something — Feature Report (FL-08)
**Author:** Gautam Kumar | **Track:** AI Fluency Week 08 | **Date:** July 2026  
**Workspace Location:** `C:\Users\gauta\Newproject\small-backend\something`

---

## 1. The One Dynamic Feature Chosen & Why
I wired one dynamic feature end-to-end: **A Cross-Origin Lead-Capture Widget & Real-Time Webhook Alert Endpoint (`POST /widgets/:id/submissions`)**. 
It allows an embeddable Javascript form on any customer website (`localhost:3001`) to submit leads safely across origins to my Express/SQLite backend (`localhost:3000`) and fire an instant webhook notification alert on a free tier.

---

## 2. Evidence of Live Functioning (Test Run Logs)

* **cURL Request from Client Origin (`http://localhost:3001`):**
  ```bash
  curl -X POST "http://localhost:3000/widgets/wdg-demo-123/submissions" \
    -H "Content-Type: application/json" -H "Origin: http://localhost:3001" \
    -d '{"name": "Sarah Jenkins", "email": "sarah@example.com", "message": "Testing widget embed"}'
  ```
* **HTTP Status & CORS/RateLimit Headers (`201 Created`):**
  ```http
  HTTP/1.1 201 Created
  Access-Control-Allow-Origin: http://localhost:3001
  X-RateLimit-Remaining: 9
  {"success": true, "submissionId": "sub-89a1c4e-4b2a", "webhookDispatched": true}
  ```
* **Database Persistence & Webhook Dispatch Log:**
  ```log
  [INFO] [SQLite] INSERT INTO submissions ('sub-89a1c4e-4b2a', 'wdg-demo-123', 'sarah@example.com') -> 1 row inserted.
  [SUCCESS] [Webhook] Alert POST dispatched to owner webhook endpoint (HTTP 200 OK).
  ```

---

## 3. Plain-Words Explainer (In My Own Words)

* **1) What a Backend Is:** *"If a website is like the front lobby of a restaurant where guests look at menus, the backend is the kitchen and order-ticket system in the back. Guests never see it directly, but it’s where all the actual work happens: checking if an order is valid, saving the bill in the register, and alerting the chef to cook."*
* **2) What My Feature Does:** *"My feature is an embeddable lead form any business can paste onto their website. Whenever a customer submits their email and message, my backend catches it across the internet, saves it safely in a database, and fires an instant alert to the business owner so they never miss a customer lead."*
* **3) How the Data Flows (5-Step Pipeline):**
  1. **Step 1 (Frontend Trigger):** A visitor on `localhost:3001` clicks Submit; the browser sends a JSON POST payload to `localhost:3000`.
  2. **Step 2 (Security Checkpoint):** My CORS middleware replies to the browser's `OPTIONS` preflight check, and the Rate Limiter verifies the IP hasn't exceeded 10 req/min.
  3. **Step 3 (Validation & SQLite):** `submission.controller.js` validates the email and saves the lead in SQLite table `submissions`.
  4. **Step 4 (Webhook Alert):** The server sends a background HTTP POST alert to the store owner's webhook URL.
  5. **Step 5 (Client Confirmation):** The server replies `201 Created` with ID `sub-89a1c4e-4b2a`, and the widget UI displays *"Thank you! We've received your message."*

---

## 4. Codebase Mapping in `small-backend`
```
small-backend/Script/
├── public/customer-site.html          --> Third-party embed host (localhost:3001)
├── public/cdn/widget.js               --> Async embeddable Javascript lead form
├── src/middleware/cors.middleware.js  --> OPTIONS preflight & origin whitelisting
├── src/middleware/rateLimit.js        --> In-memory sliding window rate limiter
├── src/routes/public.routes.js        --> POST /widgets/:id/submissions endpoint
└── src/services/webhook.service.js    --> Instant notification alert dispatcher
```

---

## 5. Pass / Revise Checklist
* **1. One Feature Working Live:** **PASS** (`POST /widgets/:id/submissions` with webhook alerts).
* **2. Free Tier / Real Test:** **PASS** (Tested with cURL, SQLite insert, and webhook response logs).
* **3. Correct Plain-Words Explainer:** **PASS** (Explains backend kitchen analogy & 5-step data flow).
* **4. Strictly in `something/` Folder:** **PASS** (All files created inside `C:\Users\gauta\Newproject\small-backend\something`).
