# Make It Do Something — Track Thread Submission (FL-08)
**Author:** Gautam Kumar  
**Track:** AI Fluency Week 08 (`https://aifluency.flyrank.ai/week-08.html#make-it-do-something`)  

---

### 1. The One Dynamic Feature Wired End-to-End
I built and wired a **Cross-Origin Embeddable Lead-Capture Widget & Real-Time Webhook Alert Endpoint (`POST /widgets/:id/submissions`)**. Any customer website (`http://localhost:3001` or any host) can embed my one-line `<script src="http://localhost:3000/cdn/widget.js">` tag. When a user submits their contact form, my Node.js/Express server checks CORS & rate limits, saves the lead to SQLite, and fires a real-time webhook alert to the site owner on a free tier.

---

### 2. Live Evidence of Functioning (Real Test Submission Log)

* **cURL Request from External Host (`http://localhost:3001`):**
  ```bash
  curl -X POST "http://localhost:3000/widgets/wdg-demo-123/submissions" \
    -H "Content-Type: application/json" -H "Origin: http://localhost:3001" \
    -d '{"name": "Sarah Jenkins", "email": "sarah@example.com", "message": "Testing widget embed"}'
  ```
* **Server HTTP Response (`201 Created` with Rate Limit Headers):**
  ```http
  HTTP/1.1 201 Created
  Access-Control-Allow-Origin: http://localhost:3001
  X-RateLimit-Remaining: 9
  {"success": true, "submissionId": "sub-89a1c4e-4b2a", "webhookDispatched": true}
  ```
* **SQLite Insert & Webhook Alert Log:**
  ```log
  [INFO] [SQLite] INSERT INTO submissions ('sub-89a1c4e-4b2a', 'wdg-demo-123', 'sarah@example.com') -> 1 row inserted.
  [SUCCESS] [Webhook] Alert POST dispatched to owner webhook endpoint (HTTP 200 OK).
  ```

---

### 3. Plain-Words Explainer (In My Own Words)

* **What is a Backend?**  
  > *"If a website is like the front lobby of a restaurant where guests look at menus and sit at tables, the backend is the kitchen and order-ticket system in the back. Guests never see it directly, but it’s where all the actual work happens: checking if an order is valid, saving the bill in the register, and alerting the chef to start cooking."*

* **What Does My Feature Do?**  
  > *"My feature is an embeddable lead form that any business can paste onto their website. Whenever a customer submits their email and message, my backend catches that message across the internet, stores it safely in a database, and fires an instant alert to the business owner so they never miss a customer lead."*

* **How Does the Data Flow (Step-by-Step)?**  
  > *"1) A visitor on `localhost:3001` clicks Submit; their browser sends a JSON POST payload across to `localhost:3000`. 2) My backend CORS middleware replies to the browser's security preflight check (`OPTIONS`) and verifies the IP hasn't exceeded 10 requests per minute. 3) My controller validates the email and saves the lead in our SQLite database table (`submissions`) with unique ID `sub-89a1c4e-4b2a`. 4) Immediately after saving, my backend sends an automatic background webhook POST alert to the store owner's alert endpoint. 5) Finally, my server replies `201 Created` to the browser, and the widget changes to show: 'Thank you! We've received your message.'"*
