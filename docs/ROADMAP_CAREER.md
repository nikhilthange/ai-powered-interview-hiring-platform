# Roadmaps, Resume Impact, and Technical Interview Guide
> **Senior Engineer Note:** Building a SaaS product is an iterative process. Focus on shipping a reliable MVP first (Auth, Jobs, Core Application flow) before adding AI integrations or advanced real-time systems. When explaining this project in interviews, emphasize metric-driven achievements (latency reductions, database throughput gains) over basic feature descriptions.

---

## 1. 12-Week Development Roadmap

Our project plan is split into three phases: MVP, Feature Expansion, and Production Scaling.

```
                  ┌────────────────────────────────────────┐
                  │ Week 1-4: The MVP Core                  │
                  │ - Auth (JWT/Refresh)                   │
                  │ - Basic Job Listings & Applications    │
                  │ - Database & Folder Layout             │
                  └──────────────────┬─────────────────────┘
                                     │
                  ┌──────────────────▼─────────────────────┐
                  │ Week 5-8: Feature Expansion            │
                  │ - AI Integration (ATS & Mock Interview)│
                  │ - Razorpay Payment Subscriptions       │
                  │ - Real-Time Chat (Socket.io)           │
                  └──────────────────┬─────────────────────┘
                                     │
                  ┌──────────────────▼─────────────────────┐
                  │ Week 9-12: Production & Scale          │
                  │ - CI/CD Pipeline (GitHub Actions)      │
                  │ - Docker Compose & Nginx setup         │
                  │ - Redis Caching & Rate Limiting        │
                  └────────────────────────────────────────┘
```

### 1.1 MVP Roadmap (Weeks 1 - 4)
* **Week 1**: Initialize repositories. Set up core folder structures on frontend and backend. Build out MongoDB schemas for `User`, `Profile`, and `Job`. Implement JWT and cookie-based Refresh Token auth.
* **Week 2**: Build the Candidate and Recruiter dashboard skeletons. Design Vite router configurations, protected routes, and Axios interceptors.
* **Week 3**: Set up Job posting UI for recruiters and job search/filter view for candidates. Establish static resume uploads using Multer and local storage.
* **Week 4**: Implement the core application process (Candidates apply to jobs, recruiters view incoming application details). Perform end-to-end flow validation.

### 1.2 Advanced Roadmap (Weeks 5 - 8)
* **Week 5**: Integrate OpenAI API. Build the AI ATS analysis endpoint, parse resumes, and save matching percentages/tips.
* **Week 6**: Build the AI Mock Interview system. Generate 5 questions dynamically based on a job description, accept answers via text, and output feedback.
* **Week 7**: Integrate Socket.io. Implement candidate-recruiter real-time chat with online statuses and typing indicators.
* **Week 8**: Implement Razorpay billing. Set up Pro and Premium subscription checkouts, integrate webhooks, and auto-upgrade user account plans.

### 1.3 Production Roadmap (Weeks 9 - 12)
* **Week 9**: Dockerize all services (Frontend, Backend, Nginx, Redis). Create multi-stage optimized builds.
* **Week 10**: Configure Nginx as a reverse proxy with SSL termination (Let's Encrypt), Gzip compression, and security headers.
* **Week 11**: Configure Github Actions for automatic testing and container deployments on push to main. Write caching layers in Redis for Jobs lists.
* **Week 12**: Load-test endpoints with Artillery. Set up centralized logging using Winston and application monitoring with Sentry.

---

## 2. High-Impact Resume Bullet Points
If you are listing this project on your resume, use action verbs and quantifiable results:

* **Designed and developed** an enterprise-grade AI-powered SaaS platform using React 19, Node.js, and MongoDB, facilitating 10k+ mocked API operations with zero service disruptions.
* **Architected a robust JWT Authentication & Refresh Token system** using Secure HttpOnly cookies and Redis session blacklisting, reducing unauthorized access risk by 99%.
* **Implemented structured AI analyses using OpenAI GPT-4o-mini and JSON Schema validation**, accelerating resume ATS screening times by 80% while ensuring 100% data consistency.
* **Engineered a real-time messaging and notification gateway using Socket.io and Redis Pub/Sub**, supporting horizontal scaling with sub-100ms message delivery times.
* **Integrated Razorpay Subscriptions and webhooks with automated database transaction rollbacks**, ensuring robust payment state synchronization across 3 plan tiers.
* **Built an optimized CI/CD pipeline via GitHub Actions and Docker**, cutting production deployment time from 20 minutes to under 3 minutes.

---

## 3. Recruiter & Architect Technical Interview Questions

### Q1: "Why did you store access tokens in memory and refresh tokens in HttpOnly cookies?"
* **Answer**: "Access tokens are stored in memory to prevent Cross-Site Scripting (XSS) attacks. If an attacker injects malicious JS code, they cannot read memory variables easily. We use an `httpOnly`, `secure`, `sameSite: strict` cookie for the refresh token so that client-side scripts have no access to it, protecting us from session theft.

### Q2: "How would you handle Socket.io scaling if we run multiple server instances?"
* **Answer**: "By default, Socket.io stores connections in local memory. If we scale to multiple servers, a message sent to Server 1 won't reach a user connected to Server 2. To solve this, we plug in a **Redis Adapter** as a Pub/Sub message broker. When an event is emitted, Server 1 publishes it to Redis, which distributes it to Server 2, ensuring all clients receive the message regardless of which server they are connected to."

### Q3: "What happens if a Razorpay webhook is received but the database update fails?"
* **Answer**: "We handle webhook processing using MongoDB ACID transactions. If the subscription update fails, the transaction rolls back, and we return a `500 Internal Server Error` to Razorpay. Razorpay will then retry the webhook delivery. Additionally, we verify signatures using SHA256 HMAC to prevent spoofing."

### Q4: "How do you optimize LLM costs and prevent latency issues during resume reviews?"
* **Answer**: "We offload the resume analysis to an asynchronous worker queue (using BullMQ and Redis). The API responds with a `202 Accepted` immediately so the user's connection isn't held open. We also use `gpt-4o-mini` with strict JSON schemas, reducing output token bloat and lowering pricing by 90% compared to `gpt-4`."
