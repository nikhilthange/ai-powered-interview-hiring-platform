# AI-Powered Interview & Hiring Platform — Complete Interview Preparation

---

## 1. Elevator Pitch (2 Minutes)

"I built an AI-Powered Interview and Hiring Platform that connects candidates, recruiters, and admins in a single ecosystem. Candidates can upload their resume and paste a job description to get an AI-driven ATS analysis — a match percentage, identified strengths, weaknesses, and interview tips. They can take mock interviews with AI-generated questions at easy/medium/hard difficulty, receive per-question scores out of 10 with detailed feedback, and get a grade (A–D) with overall strengths and areas to improve. They also get a personalized career roadmap with a phased learning plan and curated resources.

Recruiters can create job listings with salary ranges, experience levels, and requirements. Candidates apply by uploading a PDF or DOCX resume, and the system auto-extracts the text and triggers a background AI analysis. Recruiters can review applications, update status through a pipeline (Applied → Reviewing → Shortlisted → Interview Scheduled → Rejected → Hired), schedule interviews with a meeting link, and chat with candidates in real-time via Socket.io.

The platform uses JWT access tokens (15-minute expiry) with refresh token rotation and httpOnly cookies for secure session management. Role-based access control restricts endpoints to candidate, recruiter, or admin roles. Payments are handled through Razorpay with signature verification and webhook handling for Pro (₹1500/mo) and Premium (₹3900/mo) plans. The entire stack runs in Docker containers — a Node.js Express backend, a React frontend served by Nginx, and MongoDB 7 — orchestrated with Docker Compose and deployed on a VPS with SSL."

---

## 2. Why I Chose This Project

"I chose this project because hiring is fundamentally broken. The average corporate job posting receives 250+ resumes, and recruiters spend an average of 7 seconds scanning each one. Candidates are left in the dark with no feedback, no sense of where they stand, and no guidance on how to improve. I wanted to build something that uses AI to bring transparency to both sides — giving candidates actionable feedback and recruiters intelligent screening tools. It also let me demonstrate almost every important backend concept: authentication, authorization, real-time communication, file processing, payment integration, AI/LLM integration, containerization, and CI/CD."

---

## 3. Problem Statement & Business Value

**Problem**:
- Candidates get no feedback on rejected applications → can't improve
- Recruiters manually screen hundreds of resumes → slow and inconsistent
- No structured way to practice interviews with feedback
- No centralized platform for career planning and skill gap analysis

**Business Value**:
- **ATS Analysis** reduces recruiter screening time by providing AI-generated match scores and highlighted strengths/weaknesses
- **Mock Interviews** give candidates unlimited practice with AI scoring, reducing prep anxiety
- **Skill Gap Analysis** helps candidates understand exactly what to learn next
- **Career Roadmaps** provide structured 6-month learning plans
- **Subscription Model** (Free/Pro/Premium) creates recurring revenue
- **Real-time Chat & Notifications** keep all stakeholders engaged on the platform

---

## 4. High-Level Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Browser   │────▶│  Nginx :80   │────▶│  Frontend   │
│  (React 19) │     │  (Reverse    │     │  (Static    │
│             │◀────│   Proxy)     │◀────│   Files)    │
└─────────────┘     └──────┬───────┘     └─────────────┘
                           │
                    ┌──────┴───────┐
                    │  /api/v1/*   │
                    │  /socket.io/ │
                    └──────┬───────┘
                           ▼
                    ┌──────────────┐     ┌─────────────┐
                    │   Backend    │────▶│   MongoDB   │
                    │  Express.js  │     │  (Mongoose) │
                    │   :5000      │     └─────────────┘
                    └───┬───┬──────┘
                        │   │
              ┌─────────┘   └─────────┐
              ▼                       ▼
       ┌──────────┐           ┌──────────┐
        │ NVIDIA   │           │ Razorpay │
        │ NIM      │           │ Payments │
        │ Llama 3  │           └──────────┘
       └──────────┘
```

- **Docker Compose** runs three containers: `backend` (Node 18, port 5000), `frontend` (Nginx, port 80), `mongodb` (Mongo 7, port 27017)
- **Nginx** serves static React build files, proxies `/api/v1/` and `/socket.io/` to the backend, enforces rate limiting (10 req/s, burst 20), and adds security headers
- **Backend** handles all API logic, Socket.io connections, file uploads, email sending, AI calls, and payment verification
- **Frontend** is a React SPA with React Router, TanStack Query for server state, Context API for auth/theme, and Socket.io client for real-time features

---

## 5. Database Design (10 Collections)

**User** — name, email (unique, indexed), password (bcrypt hashed, select:false), role (candidate/recruiter/admin), isEmailVerified, verificationToken (hashed), passwordResetToken (hashed), refreshToken (hashed, select:false). Indexes on role, verificationToken, passwordResetToken. Pre-save hook hashes password with bcrypt cost factor 12.

**Profile** — userId (unique, ref User), fullName, avatarUrl, resumeUrl, skills[], experienceYears, careerRoadmap (Mixed type for flexible JSON), company details for recruiters. Index on skills for text search.

**Job** — recruiterId (ref User), title, description, requirements[], location, jobType (Full-time/Part-time/Contract/Remote), experienceLevel (Junior/Mid/Senior), salaryRange {min, max}, status (Active/Closed). Compound index on status+createdAt, text index on title+description for search.

**Application** — jobId + candidateId (unique compound index to prevent duplicates), resumeUrl, coverLetter, status pipeline (Applied→Reviewing→Shortlisted→Interview Scheduled→Rejected→Hired), atsScore, matchPercent, aiAnalysis {strengths[], weaknesses[], interviewTips[]}. Indexes on status, candidateId+createdAt, jobId+status.

**Interview** — applicationId, recruiterId, candidateId, scheduledAt, meetLink, status (Scheduled/Completed/Cancelled), aiInterviewFeedback. Indexes on candidateId+scheduledAt, recruiterId+scheduledAt.

**MockInterviewSession** — userId, resumeText, resumeFileName, targetRole, difficulty, embedded QuestionSchema array (question, category, difficulty, answer, score, maxScore=10, feedback, strengths[], improvements[]), overallScore, totalScore, maxTotalScore, status (pending/in_progress/completed).

**ChatRoom** + **ChatMessage** — ChatRoom has candidateId+recruiterId (unique compound index). ChatMessage has chatRoomId, senderId, messageText, isRead. Compound index on chatRoomId+createdAt for efficient pagination.

**Notification** — recipientId, type (application_update/chat_message/interview_scheduled/system_alert), title, message, isRead. Compound index on recipientId+isRead+createdAt.

**SavedJob** — userId + jobId (unique compound index).

**Subscription** — userId (unique), planId (Free/Pro/Premium), status (Active/Past-Due/Cancelled), razorpaySubscriptionId, currentPeriodEnd. Indexes on status+currentPeriodEnd for cron job queries.

---

## 6. Authentication Flow

1. **Register**: User submits name, email, password, role. Server creates User with `isEmailVerified: false`. Calls `user.createEmailVerificationToken()` which generates a `crypto.randomBytes(32)` hex token, SHA-256 hashes it for storage, sets 10-minute expiry. Sends verification email via Nodemailer with a link containing the unhashed token. If recruiter role, also notifies all admins.

2. **Verify Email**: User clicks link. Server hashes the incoming token with SHA-256 and looks up `User.findOne({ verificationToken: hashedToken, verificationTokenExpires: { $gt: Date.now() } })`. Sets `isEmailVerified = true`, clears token fields.

3. **Login**: Server finds user by email with `.select('+password')`. Uses `bcrypt.compare()` to verify. Signs JWT access token (15 min expiry) with `jwt.sign({ id }, JWT_ACCESS_SECRET, { expiresIn })`. Signs refresh token (7 day expiry) with `JWT_REFRESH_SECRET`. Hashes the refresh token with SHA-256 and stores in DB. Sends refresh token as an **httpOnly, secure, sameSite:strict** cookie. Returns access token in response body.

4. **Authenticated Requests**: Frontend Axios interceptor reads `accessToken` from localStorage, attaches `Authorization: Bearer <token>`. The `protect` middleware verifies the token with `jwt.verify(token, JWT_ACCESS_SECRET)`, looks up the user by `decoded.id`, and attaches to `req.user`.

5. **Token Expired**: On 401 with `code: 'TOKEN_EXPIRED'`, the Axios response interceptor checks if a refresh is already in progress. If not, it POSTs to `/auth/refresh` (cookie sent automatically). The server verifies the refresh token signature, hashes it, compares with DB (detects token reuse), issues new rotated tokens, updates DB, sets new cookie, returns new access token. The interceptor stores the new access token and retries the original request. If the refresh token is also invalid, the user is redirected to `/login`.

6. **Logout**: Clears `refreshToken` from DB, clears the httpOnly cookie.

---

## 7. Refresh Token Rotation Implementation

The `refreshToken` controller in `backend/controllers/authController.js:179`:

1. Reads the refresh token from `req.cookies`
2. Verifies JWT signature with `JWT_REFRESH_SECRET`
3. SHA-256 hashes the received token
4. Queries `User.findOne({ _id: decoded.id, refreshToken: hashedRefreshToken })` — if no match, returns "Token reuse detected or session invalid" (this catches stolen tokens that have already been used)
5. Signs **new** access and refresh tokens
6. Hashes the new refresh token, saves to DB
7. Sets new httpOnly cookie
8. Returns new access token

**Why rotation matters**: If an attacker steals a refresh token and uses it, the legitimate user's next refresh attempt will fail because the DB now has the rotated hash. Both parties are forced to re-login, limiting the window of compromise.

---

## 8. RBAC (Role-Based Access Control)

Implemented via the `restrictTo()` middleware in `backend/middleware/authMiddleware.js:61`:

```javascript
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }
    next();
  };
};
```

Usage on routes:
- `restrictTo('recruiter', 'admin')` — job creation, editing, deletion
- `restrictTo('candidate')` — application submission
- `restrictTo('admin')` — user management, recruiter verification

The `verifiedOnly` middleware blocks unverified email users from accessing certain features like AI analysis. The `protect` middleware is always applied first to ensure `req.user` exists.

---

## 9. Middleware Stack (Execution Order)

Defined in `backend/app.js`:

1. **`app.set('trust proxy', 1)`** — Required for correct client IP behind Nginx (rate limiting)
2. **`helmet()`** — Sets security HTTP headers (CSP, X-Frame-Options, etc.)
3. **`cors({ origin, credentials: true })`** — Enables cross-origin requests with cookies
4. **`compression()`** — Gzip-compresses all responses
5. **`morgan('dev')`** — Request logging in development
6. **`rateLimit({ max: 300, windowMs: 15m })`** — Global rate limiter at `/api`
7. **`rateLimit({ max: 10, windowMs: 15m })`** — Stricter limiter at `/api/v1/auth`
8. **`express.json({ limit: '100kb' })`** — Body parsing with size limit
9. **`cookieParser()`** — Parses cookies for refresh token
10. **`mongoSanitize()`** — Prevents NoSQL injection (`{ $ne: null }` attacks)
11. **`xss()`** — Sanitizes user input against XSS
12. **`hpp()`** — Prevents HTTP parameter pollution
13. **Static file serving** at `/uploads`
14. **Route mounting** — All 11 route groups
15. **404 handler** — `app.all('*')` catchall
16. **Global error handler** — Centralized error middleware

---

## 10. Why MongoDB Was Chosen

1. **Schema flexibility** — The `aiAnalysis` field in Applications stores unstructured JSON from NVIDIA NIM. Career roadmaps are arbitrary nested JSON. MongoDB handles this naturally without migrations.

2. **Embedded documents** — MockInterview questions are embedded arrays within sessions. Chat messages are stored in a separate collection with a compound index on `chatRoomId+createdAt` for efficient pagination.

3. **Compound indexes** — Critical for the application's query patterns: `{ jobId: 1, candidateId: 1 }` unique for deduplication, `{ status: 1, createdAt: -1 }` for job listing, `{ recipientId: 1, isRead: 1, createdAt: -1 }` for notification queries.

4. **Aggregation pipeline** — Used for the admin dashboard analytics (see section 11).

5. **Transactions** — Not currently used but the `Application` model's compound unique index on `{ jobId, candidateId }` prevents duplicate applications at the database level, which is more reliable than application-level checks.

---

## 11. Aggregation Pipeline Example

From `adminController.js`, the `getDashboardAnalytics` function uses MongoDB's aggregation pipeline:

```javascript
const [analytics] = await User.aggregate([
  {
    $group: {
      _id: '$role',
      count: { $sum: 1 }
    }
  }
]);
```

This groups users by role (candidate, recruiter, admin) and returns counts for each. The result is destructured from the array. Additional pipelines aggregate total jobs, applications, and interviews for the admin dashboard.

---

## 12. Resume Upload Flow

1. **Frontend**: Candidate selects a file on the Apply Job page. The file is sent via `multipart/form-data` using Axios with `Content-Type: multipart/form-data`.

2. **Multer Middleware** (`uploadMiddleware.js`): Configures disk storage to `../uploads/` with a unique filename (`Date.now() + '-' + originalname`). Filters by MIME type for `.pdf`, `.doc`, `.docx`. Limits file size to 5MB.

3. **Controller** (`applicationController.submitApplication`):
   - Validates the job exists and is Active
   - Checks for duplicate applications using `Application.findOne({ jobId, candidateId })`
   - Saves resume URL as `/uploads/filename`
   - Creates the application document
   - Notifies the recruiter via `createAndSend` (creates Notification + Socket.io emit + optional email)
   - **Fire-and-forget**: Extracts text from the resume using `resumeService.extractText()` which calls `fileParser.js` (uses `pdf-parse` for PDFs, `mammoth` for DOCX), then calls `aiService.analyzeResumeBackground()` asynchronously (doesn't block the response)

4. **Background Analysis**: The AI service sends the resume text + job description to NVIDIA NIM's `meta/llama-3.3-70b-instruct` model with JSON mode. The response includes `atsScore`, `matchPercent`, `strengths`, `weaknesses`, `interviewTips`. These are saved to the Application document. A notification is sent to the candidate.

---

## 13. NVIDIA NIM Integration

**File**: `backend/services/aiService.js` (735 lines)

**Architecture**:
- Initializes NVIDIA NIM client lazily — if `NVIDIA_API_KEY` is missing, runs entirely in mock mode
- Uses `meta/llama-3.3-70b-instruct` for optimal performance
- All calls use **JSON mode** (`response_format: { type: 'json_object' }`) with detailed system prompt schemas — this forces the model to return valid JSON, eliminating parsing errors

**Circuit Breaker Pattern**:
- Tracks consecutive failures; after 3 failures, opens the circuit for 60 seconds
- During open circuit, returns realistic mock data instead of calling the API
- Auto-resets after the cooldown period
- Prevents cascading failures and NVIDIA API quota exhaustion

**10 AI Functions**:
1. `analyzeResumeBackground` — Fire-and-forget ATS screening, saves to Application, sends notification
2. `analyzeResumeInteractive` — Real-time ATS analysis returned to client
3. `analyzeResumeFromFile` — Extended analysis with missingSkills, improvements, suggestedProjects, suggestedCertifications
4. `analyzeSkillGap` — currentSkills vs missingSkills analysis
5. `analyzeSkillGapFromFile` — Adds learningRoadmap with phases, resources, milestones
6. `generateMockInterviewQuestions` — 5 questions from resume + JD
7. `analyzeInterviewFeedback` — Evaluates Q&A pairs
8. `generateCareerRoadmap` — Phased plan from current skills to target role
9. `generateDifficultyQuestions` — 5 categorized questions (Technical, System Design, Problem Solving, Domain Knowledge, Behavioral) at easy/medium/hard
10. `scoreAnswer` — Scores single answer out of 10 with feedback, strengths, improvements
11. `generateOverallFeedback` — Complete session review with grade

---

## 14. Skill Gap Analyzer Implementation

**Flow**:
1. Candidate pastes resume text (or uploads file) and enters a target role
2. Controller calls `aiService.analyzeSkillGap()` or `analyzeSkillGapFromFile()`
3. NVIDIA NIM receives structured prompt asking for current skills, missing skills, gap analysis, and recommendations
4. With file upload, response also includes a `learningRoadmap` with 3 phases (Foundations, Intermediate, Advanced), each having duration, focus, skillsToLearn, resources (with URLs), and milestones
5. Result is returned to the frontend and displayed in the `SkillGapAnalysis.jsx` page

**Key technical detail**: The file upload variant uses `analyzeSkillGapFromFile` which has a much more complex JSON schema (nested objects with arrays of resources containing name+url pairs). Both use `response_format: json_object` with detailed system prompt schemas to guarantee valid structure.

---

## 15. Mock Interview Implementation

**File**: `mockInterviewController.js` + `models/MockInterviewSession.js`

**Architecture** (3-stage process):

1. **Create Session** (`POST /session/create`):
   - User uploads resume, provides targetRole and difficulty (easy/medium/hard)
   - Resume text is extracted via `resumeService.extractText`
   - Session is created with `status: 'pending'`, embedded questions array is empty

2. **Generate Questions** (`POST /session/generate-questions`):
   - Validates session ownership and status
    - Calls `generateDifficultyQuestions(resumeText, targetRole, difficulty)` — sends to NVIDIA NIM with 5 categories
   - Each question stored as embedded subdocument with `maxScore: 10`
   - Session status changes to `in_progress`

3. **Submit Answers** (`POST /session/submit-answer`):
   - One answer at a time (sessionId + questionId + answer)
   - Validates question not already answered
    - Calls `scoreAnswer(question, answer, difficulty)` — NVIDIA NIM evaluates and returns score (0-10), feedback, strengths, improvements
   - Updates running `totalScore`

4. **Complete Session** (`POST /session/complete`):
   - Validates all questions answered
   - Calculates `overallScore = (totalScore / maxTotalScore) * 100`
   - Calls `generateOverallFeedback()` for qualitative review
   - Returns grade: A (≥90%), B (≥75%), C (≥60%), D (<60%)
   - Status changes to `completed`

---

## 16. Career Roadmap Implementation

**Two paths**:

1. **From profile skills** (`POST /profiles/roadmap`): User selects skills from their profile, provides targetRole. Controller calls `aiService.generateCareerRoadmap(skills, targetRole)`. Result is saved to the profile's `careerRoadmap` field (Mixed type in Mongoose).

2. **From resume upload** (`POST /interviews/career-roadmap-upload`): User uploads resume, text is extracted, controller calls the same AI function with extracted skills + target role.

The AI returns a structured roadmap with `estimatedMonths` and `phases` array (title, duration, skillsToLearn, recommendedResources). This is displayed in the `CareerRoadmap.jsx` page.

---

## 17. Job Application Workflow

1. **Recruiter creates job** (`POST /jobs`): Form with title, description, requirements, location, jobType, experienceLevel, salaryRange
2. **Job appears on jobs page** (`GET /jobs`): Paginated, filterable by jobType, experienceLevel, location, salary range; searchable by text index on title+description
3. **Candidate applies** (`POST /applications/:jobId`): Uploads resume, optionally adds cover letter. Server checks for duplicates via compound unique index
4. **Recruiter reviews** (`GET /applications/job/:jobId`): See all applications with AI analysis
5. **Status updates** (`PATCH /applications/:id/status`): Recruiter moves through the pipeline. Each status change triggers a real-time notification and optional email
6. **Interview scheduling** (`POST /interviews`): Recruiter sets scheduledAt datetime and meetLink. Candidate receives notification
7. **Chat** (`POST /chats/rooms` + Socket.io): Once application is in process, candidate and recruiter can communicate in real-time

---

## 18. Razorpay Payment Workflow

1. **Frontend**: User selects Pro (₹1500) or Premium (₹3900) plan on `PlansPage.jsx`
2. **Create Order** (`POST /payments/create-order`): Backend calls `paymentService.createBillingOrder(amount, currency)`, returns `orderId` and `keyId` to frontend
3. **Checkout**: Frontend initializes Razorpay checkout modal with the `orderId` and `keyId`
4. **Payment**: User completes payment on Razorpay's UI. Razorpay calls the frontend callback with `razorpay_payment_id`, `razorpay_order_id`, `razorpay_signature`
5. **Verification** (`POST /payments/verify`): Backend verifies the HMAC SHA256 signature using `paymentService.verifyPaymentSignature()`. On success, creates/updates the Subscription document with planId='Pro'/'Premium', status='Active', 30-day period
6. **Webhook** (`POST /payments/webhook`): Razorpay also sends server-to-server events. The webhook handler verifies the `x-razorpay-signature` header with HMAC SHA256, then handles `payment.captured`, `subscription.charged`, and `subscription.cancelled` events
7. **Cron job** (`subscriptionJobs.js`): Runs daily at midnight, finds subscriptions past `currentPeriodEnd`, downgrades to Free

---

## 19. Socket.io Real-Time Notification Architecture

**Backend** (`socketManager.js`):
- JWT authentication at the handshake level — verifies token from `socket.handshake.auth.token` or `x-auth-token` header
- On connection: adds user to `onlineUsers` Map, joins `notifications:{userId}` room, broadcasts updated `online_users` list
- `send_message`: Creates ChatMessage in DB, emits `receive_message` to room, creates Notification for other user, emits to their notification room
- `mark_read`: Updates `isRead` on all unread messages from other sender, emits `messages_read` to room
- `typing`: Broadcasts `typing_status` to room (excluding sender)
- `refresh_token`: Allows re-authentication without reconnection
- `sendSocketNotification()` utility: Creates Notification document and emits to user's notification room

**Frontend** (`useSocket.js`):
- Connects when user is authenticated
- Tracks `onlineUsers` Set and `typingUsers` object
- Provides joinRoom, sendMessage, emitTyping, markRead
- `useNotifications` hook uses TanStack Query with Socket.io integration — real-time notifications update the query cache instantly

---

## 20. File Upload Architecture (Multer + Cloudinary)

**Current implementation**: Uses Multer with disk storage to a local `uploads/` directory:
```javascript
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
```
Files are served statically via `app.use('/uploads', express.static(...))`.

**If Cloudinary were integrated** (the middleware setup is prepared):
1. Multer handles the incoming `multipart/form-data` in memory or to disk
2. The controller would upload the buffer to Cloudinary using their Node.js SDK
3. Cloudinary returns a URL which gets stored in the database
4. The local file is deleted after upload

 **Resume text extraction**: After upload, `resumeService.extractText()` calls `fileParser.js` which uses `pdf-parse` (for PDFs) or `mammoth` (for DOCX) to extract raw text. The text is sent to NVIDIA NIM for analysis. The temporary file is cleaned up via the `cleanup()` function.

---

## 21. Email Verification & Password Reset

**Verification** (`authController.verifyEmail`):
- Token generated via `crypto.randomBytes(32).toString('hex')`, SHA-256 hashed for storage
- 10-minute expiry stored as `verificationTokenExpires`
- Link sent to user: `${clientUrl}/verify-email?token=${unhashedToken}`
- Verification hashes incoming token and finds match with `$gt: Date.now()`

**Password Reset** (`authController.forgotPassword` + `resetPassword`):
- Same token generation pattern but uses `passwordResetToken` and `passwordResetExpires`
- **Email enumeration protection**: Always returns the same success message whether the email exists or not
- **Rollback on email failure**: If Nodemailer fails, the token is cleared from DB to prevent orphan tokens
- **Session invalidation**: On password reset, `refreshToken` is set to `undefined`, forcing all sessions to log out

**Nodemailer**: Creates SMTP transporter from env vars. Falls back to console logging if SMTP is not configured (development convenience).

---

## 22. Error Handling Strategy

**Custom Error Class** (`utils/appError.js`):
- Extends JavaScript Error with `statusCode`, `status` ('fail' for 4xx, 'error' for 5xx), `isOperational: true` flag
- `Error.captureStackTrace` for clean stack traces

**Async Handler** (`utils/asyncHandler.js`):
- Wraps every async route handler in a Promise that catches errors and forwards to `next(err)`
- Eliminates try/catch boilerplate in every controller

**Global Error Middleware** (`middleware/errorHandler.js`):
- Development mode: Returns full error object with stack trace
- Production mode:
  - **Operational errors** (expected): Returns clean `{ status, message, code }` response
  - **Programming errors** (unexpected): Returns generic "Something went wrong internally" with no details leaked
  - **CastError** (invalid ObjectId): 400 "Invalid ID format"
  - **Duplicate key (11000)**: 400 "Duplicate field value"
  - **ValidationError**: 400 with field-specific messages
  - **JsonWebTokenError**: 401 "Invalid token signature"
  - **TokenExpiredError**: 401 with `code: 'TOKEN_EXPIRED'` for Axios interceptor

**Server-level handlers** (`server.js`):
- `uncaughtException`: Logs details, exits with 1
- `unhandledRejection`: Logs details but does NOT crash the server
- `SIGTERM`/`SIGINT`: Graceful shutdown — closes HTTP server, disconnects MongoDB, force exits after 10s timeout

---

## 23. Security Measures Implemented

1. **Helmet** — 15 HTTP security headers including CSP, X-Frame-Options, X-Content-Type-Options
2. **CORS** — Restricted to `CLIENT_URL` origin with credentials
3. **Express Mongo Sanitize** — Strips `$` and `.` from input to prevent NoSQL injection (e.g., `{ "email": { "$ne": null } }`)
4. **XSS Clean** — Sanitizes user input against cross-site scripting
5. **HPP** — Prevents HTTP parameter pollution
6. **Rate Limiting** — Auth endpoints: 10 req/15min, Global API: 300 req/15min, Nginx: 10 req/s burst 20
7. **JWT with Rotation** — 15-min access tokens, 7-day refresh tokens with rotation (old tokens invalidated on use, detecting theft)
8. **httpOnly Cookies** — Refresh tokens are never accessible to JavaScript
9. **Password Hashing** — bcrypt with cost factor 12, field excluded from default queries (`select: false`)
10. **Email Verification** — Required for AI features via `verifiedOnly` middleware
11. **RBAC** — Three roles with `restrictTo()` middleware
12. **Payment Signature Verification** — HMAC SHA256 for both client-side verification and webhook events
13. **Request Size Limit** — Body parsing limited to 100kb
14. **Graceful Shutdown** — Handles SIGTERM/SIGINT properly
15. **Token Expiry for Verification/Reset** — All tokens expire after 10 minutes
16. **Error Leak Prevention** — Production mode doesn't expose stack traces for non-operational errors

---

## 24. Rate Limiting Implementation

**Three layers**:

1. **Nginx** (`nginx.conf`):
```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
```
Applied to `/api/v1/` and `/socket.io/` locations with `burst=20` and `nodelay`.

2. **Express Global** (`app.js:72`):
```javascript
const globalLimiter = rateLimit({
  max: 300,
  windowMs: 15 * 60 * 1000,
  message: 'Too many requests from this IP. Please try again in 15 minutes.'
});
app.use('/api', globalLimiter);
```

3. **Express Auth-Specific** (`app.js:15`):
```javascript
const authLimiter = rateLimit({
  max: 10,
  windowMs: 15 * 60 * 1000,
  message: 'Too many authentication attempts. Please try again in 15 minutes.',
});
app.use('/api/v1/auth', authLimiter);
```

`app.set('trust proxy', 1)` is set so that Express sees the real client IP behind Nginx.

---

## 25. Caching Strategy

**Current implementation does not use a dedicated caching layer (like Redis)**. This is a known trade-off:

- **What exists**: Express `compression()` middleware for gzip on all responses
- **What's missing**: No Redis caching, no in-memory cache, no ETag headers
- **Mitigation**: MongoDB queries are properly indexed for the most common access patterns. The Nginx proxy could cache static assets but doesn't currently.

**What I would add**: Redis caching for:
- Job listings (TTL 5 minutes, invalidated on create/update/delete)
- Application analyses (TTL 1 hour)
- User sessions as an alternative to JWT blacklisting

---

## 26. Docker Deployment

**Dockerfile.backend**:
- Multi-stage: builder copies `package.json`, runs `npm ci --only=production`
- Final stage uses `node:18-alpine`
- Creates non-root `app` user (UID 1001) for security
- HEALTHCHECK on `/api/v1/auth/health`
- CMD: `node server.js`

**Dockerfile.frontend**:
- Multi-stage: builder uses `node:20-alpine`, builds Vite app with `VITE_API_URL` arg
- Final stage uses `nginx:alpine`, copies `dist/` to `/usr/share/nginx/html`, copies custom `nginx.conf`

**docker-compose.yml**:
```yaml
services:
  backend:
    build: Dockerfile.backend
    ports: ["5000:5000"]
    depends_on: mongodb (healthcheck with mongosh)
    volumes: [backend-uploads, ./.env:/app/.env]
  frontend:
    build: Dockerfile.frontend
    ports: ["80:80"]
  mongodb:
    image: mongo:7
    volumes: [mongo-data:/data/db]
network: app-network (bridge)
```

---

## 27. Nginx Reverse Proxy

**nginx.conf**:
- `worker_processes auto` — uses all CPU cores
- Security headers: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `X-XSS-Protection: 1; mode=block`, `Referrer-Policy: strict-origin-when-cross-origin`
- Gzip compression for API responses
- Rate limiting zone: 10 req/s, burst 20
- Upstream `backend_servers` pointing to `backend:5000`
- Server block:
  - `GET /health` — health check (no rate limit)
  - `/` — Serves frontend static files, SPA fallback with `try_files $uri $uri/ /index.html`
  - `/uploads/` — Proxies file serving
  - `/api/v1/` — Proxies with rate limiting + adds `Upgrade` and `Connection` headers for WebSocket
  - `/socket.io/` — WebSocket proxy with proper upgrade headers

---

## 28. CI/CD (GitHub Actions)

The `.github/workflows` directory exists but is currently **empty** (no workflow YAML files yet). This is an area for improvement.

**What I would implement**:
```yaml
name: Deploy to VPS
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build and push Docker images
        run: docker compose build
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /app
            git pull
            docker compose up -d --build
```

---

## 29. Scaling to 100k+ Users

1. **Horizontal scaling**: Run multiple backend containers behind Nginx load balancing. The `upstream backend_servers` block in nginx.conf already supports multiple servers.

2. **MongoDB scaling**:
   - Replica set for read scalability and failover
   - Sharding for write scalability (shard key could be `userId` for user-centric collections)
   - Proper index usage is already in place

3. **Caching**: Add Redis for job listings, session data, and API response caching. Reduce NVIDIA NIM calls by caching similar analyses.

4. **NVIDIA NIM**:
   - Implement request queuing with rate limit awareness
   - Batch background analyses
   - Use the circuit breaker pattern already in place

5. **File storage**: Move from local disk to Cloudinary or S3 for distributed file access.

6. **Socket.io**:
   - Use Redis adapter for cross-instance WebSocket communication
   - Scale horizontally with sticky sessions or a pub/sub adapter

7. **Database optimization**:
   - Pagination on all list endpoints (already implemented with `.sort()` and would add `.skip()/.limit()`)
   - Projection to select only needed fields (some queries already use `.select()`)

---

## 30. What I Would Improve Given More Time

1. **Redis caching layer** — Cache job listings, application analyses, and user sessions. Reduce DB load by 60%+.

2. **CI/CD pipeline** — Automated testing, Docker build, and deployment via GitHub Actions.

3. **Load testing** — Use k6 or Artillery to benchmark and find bottlenecks.

4. **Unit and integration tests** — Currently zero tests. Jest for backend, Vitest for frontend.

5. **TypeScript migration** — Better type safety across the board. Use Zod for runtime validation (already partially done for request bodies).

6. **Dedicated search service** — Elasticsearch for full-text job and candidate search instead of MongoDB text indexes.

7. **Cloudinary/S3 integration** — For production file storage instead of local disk.

8. **Admin dashboard analytics** — More sophisticated aggregation pipelines with time-series data.

9. **Email templates** — Replace inline HTML with a template engine (Handlebars/React Email).

10. **Progressive Web App** — Offline support and push notifications via service workers.

---

## 31. Biggest Challenges Faced

1. **NVIDIA NIM JSON output reliability**: Getting the model to consistently return valid JSON was a challenge until I switched to `response_format: json_object` with detailed system prompt schemas. Before that, I had to parse and validate outputs with retry logic. The circuit breaker pattern emerged from production issues where API timeouts would cascade.

2. **Refresh token rotation complexity**: The flow of detecting token reuse while maintaining a seamless user experience was tricky. The Axios interceptor queue (`failedQueue`) prevents race conditions where multiple simultaneous 401 responses would each try to refresh the token independently.

3. **PDF/DOCX text extraction**: Different file formats, encoding issues, password-protected PDFs, and corrupted files all required graceful error handling. The `cleanup()` pattern to remove temp files even after errors was essential.

4. **Socket.io authentication race conditions**: The WebSocket connection could succeed before the JWT was set in local storage. Adding the `refresh_token` event for re-authentication without reconnection solved this.

5. **MongoDB compound index design**: Getting the right indexes without over-indexing was a balancing act. The unique compound index on `Application({ jobId, candidateId })` prevents duplicate applications at the DB level, which is far more reliable than application-level checks.

---

## 32. Trade-offs and Design Decisions

| Decision | Trade-off |
|----------|-----------|
| **Local file storage vs Cloudinary** | Local storage is simpler for MVP but doesn't scale horizontally. Would migrate to Cloudinary for production. |
| **No Redis cache** | Simplified initial deployment but limits scalability. Redis would add operational complexity. |
| **Zod validation on backend only** | Consistent server-side validation but no shared types with frontend. TypeScript would help. |
| **meta/llama-3.3-70b-instruct vs larger models** | Faster and cost-efficient, slightly less accurate for nuanced analysis. Worth the trade-off. |
| **No testing** | Faster initial development. Bad for long-term maintainability. Would add Jest tests next. |
| **Disk storage for Multer** | Simpler than memory storage with Cloudinary upload. Requires local cleanup logic. |
| **Embedded questions in MockInterviewSession** | Faster reads, but each session is limited in size. Fine for 5-10 questions; would need separate collection for larger sets. |
| **httpOnly cookies for refresh tokens** | More secure than localStorage but requires CORS with credentials configuration. |
| **RBAC over ABAC** | Simpler to implement but less flexible. ABAC would be needed for fine-grained permissions. |

---

## 33. Common Bugs and How I Fixed Them

1. **Race condition on token refresh** — Multiple simultaneous API calls would each trigger a refresh. **Fix**: The `isRefreshing` flag + `failedQueue` pattern queues all callers behind a single refresh request.

2. **Socket.io token expired on reconnect** — If the access token expired while the socket was disconnected, reconnect would fail. **Fix**: The `refresh_token` event allows re-authentication without closing the connection.

3. **Password field included in user responses** — `select: false` wasn't working on populated queries. **Fix**: Explicitly setting `user.password = undefined` in the login response.

4. **CORS cookie not sent** — Frontend on port 5173, backend on 5000. Cookies weren't being set. **Fix**: Added `withCredentials: true` to Axios and `credentials: true` to CORS config.

5. **Multer file cleanup on error** — If text extraction failed, the uploaded file remained on disk. **Fix**: The `cleanup()` function is called in both success and error paths.

6. **Empty PDF extraction** — Some PDFs returned empty strings from pdf-parse. **Fix**: Added fallback text and validation before calling NVIDIA NIM.

7. **Duplicate applications** — Race condition on rapid double-clicks. **Fix**: Compound unique index on `{ jobId, candidateId }` in MongoDB — the database enforces uniqueness at the storage level.

8. **Refresh token reuse detection false positives** — Legitimate parallel requests could trigger reuse detection. **Fix**: The Axios interceptor queues requests during refresh so only one refresh ever happens at a time.

---

## 34. 50 Interviewer Questions with Ideal Answers

**Q1: What is the tech stack?**
A: React 19 with Vite and Tailwind CSS on the frontend, Node.js with Express.js on the backend, MongoDB with Mongoose for the database. Real-time features use Socket.io, payments use Razorpay, AI features use NVIDIA NIM (meta/llama-3.3-70b-instruct), and the entire stack is containerized with Docker and deployed behind Nginx.

**Q2: How does authentication work?**
A: Two-token JWT system. Access tokens expire in 15 minutes and are stored in localStorage. Refresh tokens expire in 7 days, are SHA-256 hashed and stored in the database, and sent as httpOnly, secure, sameSite:strict cookies. On access token expiry, the Axios interceptor automatically calls a refresh endpoint that verifies the refresh token, rotates it (generates a new one, invalidates the old one), and retries the original request.

**Q3: Explain the refresh token rotation flow.**
A: The refresh endpoint reads the httpOnly cookie, verifies the JWT signature with the refresh secret, hashes the token to compare with the stored hash in the User document. If it matches, it generates new access and refresh tokens, stores the new hashed refresh token, and returns the new access token. If the stored hash doesn't match, it means the token was already used (stolen), so we reject with 401 "Token reuse detected."

**Q4: How do you prevent duplicate applications?**
A: At two levels. First, the controller checks `Application.findOne({ jobId, candidateId })` before creating. Second, there's a MongoDB compound unique index on `{ jobId: 1, candidateId: 1 }` that prevents race conditions at the database level.

**Q5: How is RBAC implemented?**
A: Three roles: candidate, recruiter, admin. The `restrictTo(...roles)` middleware checks `req.user.role` against allowed roles. Additionally, the `verifiedOnly` middleware blocks unverified users from AI features. Admin routes also check ownership — for example, a recruiter can only view applications for their own jobs.

**Q6: Explain the AI integration architecture.**
A: We use NVIDIA NIM's meta/llama-3.3-70b-instruct model with JSON mode (`response_format: json_object`) to get deterministic JSON responses. We have a circuit breaker pattern that tracks failures — after 3 consecutive failures, we fall back to realistic mock data for 60 seconds. There are 11 AI functions covering resume analysis, skill gap analysis, mock interview question generation, answer scoring, career roadmap generation, and interview feedback analysis.

**Q7: What's the circuit breaker pattern?**
A: It's a resilience pattern. The `circuitBreaker` object tracks consecutive failures. When failures reach 3, `isOpen` is set to true, and all subsequent calls return mock data instead of hitting the NVIDIA NIM API. A 60-second timeout auto-resets the breaker. This prevents cascading failures, saves API costs during outages, and ensures the app remains functional even when NVIDIA is down.

**Q8: How does the mock interview work?**
A: Three-stage process: Create Session (upload resume, set role and difficulty) → Generate Questions (AI creates 5 categorized questions with easy/medium/hard levels) → Submit Answers (one at a time, AI scores each out of 10 with feedback) → Complete Session (AI generates overall feedback, a grade from A to D, and lists top strengths and areas to improve).

**Q9: What real-time features use Socket.io?**
A: Chat messaging between candidates and recruiters, typing indicators, read receipts, online user presence, and real-time notifications for application updates, interview scheduling, and system alerts.

**Q10: How is payment handled?**
A: Razorpay integration. The frontend calls createOrder, gets an order ID, opens the Razorpay checkout modal. On success, the frontend sends the payment details to our verify endpoint, which validates the HMAC SHA256 signature. We also have a webhook handler that processes payment.captured, subscription.charged, and subscription.cancelled events from Razorpay server-to-server.

**Q11: What security measures are in place?**
A: Helmet for HTTP headers, CORS restricted to the client origin, MongoSanitize to prevent NoSQL injection, XSS-Clean for cross-site scripting prevention, HPP for parameter pollution, rate limiting at both Nginx and Express levels, JWT token rotation, httpOnly cookies, bcrypt password hashing with cost factor 12, 100kb request size limit, and email verification for sensitive features.

**Q12: How are files uploaded and processed?**
A: Multer handles multipart/form-data uploads with disk storage. Resumes are validated by MIME type (.pdf, .doc, .docx) and size (max 5MB). After upload, the file path is passed to `fileParser.js`, which uses `pdf-parse` for PDFs and `mammoth` for DOCX to extract text. The extracted text is sent to NVIDIA NIM for analysis. Temporary files are cleaned up via the `cleanup()` function.

**Q13: Explain the error handling strategy.**
A: Custom `AppError` class with operational vs programming error distinction. Async handlers are wrapped in a utility that catches errors and forwards them. A centralized error middleware handles all errors in one place: it distinguishes dev vs production mode (dev gets stack traces, production only gets clean messages), and handles specific error types like CastError (bad ObjectId), duplicate key (11000), validation errors, and JWT errors.

**Q14: How does the email verification work?**
A: On registration, we generate a crypto.randomBytes(32) token, SHA-256 hash it for DB storage, set a 10-minute expiry, and email the unhashed token as a URL parameter. On verification, we hash the incoming token, find the user by hash + expiry check, mark as verified, and clear the token fields.

**Q15: Why MongoDB over PostgreSQL?**
A: Schema flexibility was the primary reason. The AI analysis results, career roadmaps, and user profiles have varying structures that don't fit neatly into relational tables. The embedded document model works well for mock interview questions within sessions. MongoDB's compound indexes and aggregation pipelines handle our query patterns efficiently.

**Q16: How would you scale this to 100k users?**
A: Horizontal scaling of the backend behind Nginx load balancing, MongoDB replica sets for read scalability and sharding for write scalability, Redis caching layer for jobs and analyses, Redis Socket.io adapter for cross-instance WebSocket communication, moving file storage to Cloudinary/S3, and implementing proper pagination with cursor-based queries.

**Q17: How does the Axios interceptor work?**
A: On request, it attaches the Bearer token from localStorage. On response, if status is 401 with code TOKEN_EXPIRED and it's not a retry, it checks if a refresh is in progress. If yes, it queues the request in `failedQueue`. If no, it sets `isRefreshing`, calls `/auth/refresh` with the httpOnly cookie, stores the new token, replays the queued requests, and retries the original request.

**Q18: What's the Nginx configuration doing?**
A: Serving the React static build, reverse-proxying API requests to the backend on port 5000, proxying WebSocket connections with proper upgrade headers, applying rate limiting (10 req/s, burst 20), setting security headers, enabling gzip compression, and providing SPA fallback routing.

**Q19: How are notifications delivered?**
A: Two channels. Real-time via Socket.io — each user connects to a `notifications:{userId}` room on authentication. The `createAndSend()` utility creates a Notification document in MongoDB, then emits to the user's Socket.io room. For email, the same utility optionally sends via Nodemailer using SMTP configuration.

**Q20: Explain the skill gap analysis.**
A: The candidate provides their resume text and a target role. The AI compares their current skills (extracted from the resume) against the skills typically required for the target role. It returns: currentSkills, missingSkills, a textual gap analysis, actionable recommendations, and (for file upload) a structured learning roadmap with phases, resources, and milestones.

**Q21: How do background tasks work?**
A: Background AI analysis is done via fire-and-forget pattern — after the application response is sent, we call `aiService.analyzeResumeBackground()` with `.catch()` to handle errors. Subscription expiry is handled by a `node-cron` job scheduled daily at midnight that queries for subscriptions past their `currentPeriodEnd` and downgrades them to Free.

**Q22: What is the admin role responsible for?**
A: Admins can view all users, delete users, verify or reject recruiter company verification, and access dashboard analytics showing user counts by role, total jobs, total applications, and total interviews via MongoDB aggregation pipelines.

**Q23: How are interviews scheduled?**
A: Recruiters create interviews via `POST /interviews` with an applicationId, scheduledAt datetime, and meetLink. The system validates the application exists and the recruiter owns the job. Both the candidate and recruiter receive real-time notifications.

**Q24: What testing is in place?**
A: Currently, no automated tests. This is a known gap I would address by adding Jest for backend unit/integration tests and Vitest + React Testing Library for frontend component tests.

**Q25: How does the career roadmap work?**
A: The user provides their current skills and a target role. The AI generates a phased plan with estimated duration (e.g., 6 months), divided into phases (e.g., Foundation Building, Enterprise Architecture, System Deployment). Each phase includes skills to learn, recommended resources, and milestones.

**Q26: What's the deployment process?**
A: Docker Compose orchestrates three containers: backend (Node.js), frontend (Nginx), and MongoDB. The Dockerfiles use multi-stage builds for smaller images. The backend runs as a non-root user. Nginx is configured with rate limiting, security headers, and WebSocket support.

**Q27: Why httpOnly cookies for refresh tokens instead of localStorage?**
A: httpOnly cookies are inaccessible to JavaScript, making them immune to XSS attacks. If an attacker injects script, they can read localStorage but not httpOnly cookies. The access token in localStorage has a short 15-minute expiry, limiting the damage window.

**Q28: How is the NVIDIA API key secured?**
A: It's stored in a `.env` file on the server (as `NVIDIA_API_KEY`), never exposed to the frontend. All AI calls are made server-side. The `.env` file is in `.gitignore`. In Docker, it's mounted as a volume or passed as a build arg (preferably a Docker secret in production).

**Q29: What are the subscription plans?**
A: Free (default), Pro (₹1500/month), and Premium (₹3900/month). The plans are mapped in the `paymentController.js` PLANS object with amounts in INR. Subscriptions are stored with a 30-day period and are auto-downgraded by a daily cron job.

**Q30: How do you handle file parsing errors?**
A: Gracefully. PDF and DOCX extraction is wrapped in try/catch. If extraction fails, the file is cleaned up, the error is logged, and the application is still created without AI analysis (the analyzeResumeBackground call is skipped for that application).

**Q31: What is the role of Zod in the project?**
A: Zod provides runtime request body validation via `validateBody(schema)` middleware. Each route group has a validator file that defines schemas for create/update operations. For example, the auth validator validates email format, password strength (min 8 chars, must contain specific characters), and required fields.

**Q32: How does the chat room system work?**
A: ChatRoom is created with candidateId and recruiterId (unique compound index prevents duplicate rooms). Messages are stored in a separate ChatMessage collection. Socket.io handles real-time message delivery, typing indicators, and read receipts. Messages are paginated by `chatRoomId+createdAt` compound index.

**Q33: What is the notification helper doing?**
A: The `createAndSend()` function in `notificationHelper.js` creates a Notification document with recipientId, type, title, and message. If a Socket.io instance is available, it emits to the recipient's notification room. If `sendEmail` is true, it also sends via Nodemailer.

**Q34: How are environment variables managed?**
A: A `.env` file in the backend directory is loaded by `dotenv` at startup. The server validates required variables (MONGO_URI, JWT secrets, expiry durations) and exits with a clear error message if any are missing. The `.env.example` serves as documentation.

**Q35: What are the MongoDB indexes?**
A: User: role, verificationToken, passwordResetToken. Job: status+createdAt compound, text index on title+description, recruiterId+status+createdAt. Application: unique jobId+candidateId, status, candidateId+createdAt, jobId+status. Notification: recipientId+isRead+createdAt. ChatMessage: chatRoomId+createdAt. Subscription: status+currentPeriodEnd, razorpaySubscriptionId.

**Q36: How does the application status pipeline work?**
A: Valid statuses are: Applied → Reviewing → Shortlisted → Interview Scheduled → Rejected → Hired. The controller validates the new status against this list. Each status change triggers a `createAndSend` notification (both Socket.io and email) to the candidate.

**Q37: What's the difference between interactive and background resume analysis?**
A: Interactive (`analyzeResumeInteractive`) is called when a user explicitly requests analysis — it returns the result synchronously in the HTTP response. Background (`analyzeResumeBackground`) is fire-and-forget after application submission — it updates the Application document asynchronously and sends a notification when done.

**Q38: How do you handle WebSocket authentication?**
A: The Socket.io server has a middleware that extracts the JWT from `socket.handshake.auth.token` or the `x-auth-token` header. It verifies the token, looks up the user, and attaches `socket.user`. If the token is expired, it returns a special `TOKEN_EXPIRED` error that the client's socket service handles by refreshing the token and reconnecting.

**Q39: What is the graceful shutdown process?**
A: On SIGTERM or SIGINT, the server stops accepting new connections, closes the HTTP server and Socket.io, disconnects from MongoDB, and exits. A 10-second timeout forces exit if graceful shutdown takes too long.

**Q40: How do you prevent NoSQL injection?**
A: Using `express-mongo-sanitize` middleware, which strips `$` and `.` from `req.body`, `req.query`, and `req.params`. This prevents attacks like `{ "email": { "$ne": "" } }` that would bypass authentication.

**Q41: How are recommended jobs implemented?**
A: The `GET /jobs/recommended` endpoint (in `jobController.js`) takes the user's skills from their profile and filters jobs whose requirements overlap. The query uses MongoDB's `$in` operator on the skills array.

**Q42: How does the Razorpay webhook work?**
A: Razorpay sends POST requests to `/payments/webhook` for events like payment.captured, subscription.charged, and subscription.cancelled. The endpoint verifies the HMAC SHA256 signature from the `x-razorpay-signature` header. If valid, it updates the Subscription document accordingly (activating, renewing, or cancelling).

**Q43: What is the `cleanup()` function?**
A: It's a utility that removes temporary uploaded files from disk using `fs.unlink`. It's called in success paths and in catch blocks to prevent disk space leaks from failed extractions.

**Q44: How do you handle NVIDIA NIM rate limits?**
A: The circuit breaker pattern provides a fallback if the API is consistently unavailable. We use the efficient `meta/llama-3.3-70b-instruct` model to stay within quota.

**Q45: What's the Vite configuration doing?**
A: In development, Vite proxies `/api`, `/uploads`, and `/socket.io` requests to the backend at localhost:5000. It uses the Tailwind CSS v4 plugin and React plugin. In production, Vite builds static files that are served by Nginx.

**Q46: How does the saved jobs feature work?**
A: A separate `SavedJob` collection with `userId` and `jobId` (unique compound index). The frontend calls POST to save, DELETE to unsave, and GET to list. A `check` endpoint returns whether a specific job is saved.

**Q47: What are the deployment prerequisites?**
A: A VPS with Docker and Docker Compose installed, a domain with DNS pointing to the server, environment variables configured in the `.env` file, and an SSL certificate (via Let's Encrypt/Caddy) for HTTPS.

**Q48: How is the password reset flow different from verification?**
A: Same token generation pattern (crypto.randomBytes, SHA-256 hash, 10-minute expiry). The difference is the purpose: verification confirms email ownership, reset allows changing the password. Reset also clears the refreshToken, invalidating all existing sessions for security.

**Q49: What logging is implemented?**
A: Morgan for HTTP request logging in development mode. Console.log/error for application-level logging across the AI service, Socket.io, file parsing, webhook processing, and graceful shutdown. Production would benefit from a structured logging service like Winston.

**Q50: What is the `asyncHandler` utility?**
A: It's a higher-order function that wraps async Express route handlers. It catches any rejected promise and passes the error to `next()`, eliminating the need for try/catch blocks in every controller method.

---

## 35. 20 Follow-Up Technical Questions with Deeper Explanations

**Q1: Why did you choose crypto.randomBytes(32) specifically for tokens?**
A: 32 bytes = 256 bits of entropy. This is the industry standard for security tokens (equivalent to a 256-bit key). The output is 64 hex characters. With this entropy, the probability of guessing a valid token is effectively zero — roughly 1 in 10^77.

**Q2: How do you prevent timing attacks on password comparison?**
A: bcrypt's `compare()` function is designed to be constant-time — it does not short-circuit on the first mismatching character. This prevents attackers from measuring response time to guess the password one character at a time.

**Q3: Why SHA-256 hash the refresh token before storing in DB?**
A: If the database is compromised, an attacker could use stored refresh tokens to impersonate users indefinitely. By storing only the SHA-256 hash, a database breach doesn't expose valid tokens. The hash is one-way and salted implicitly by bcrypt on the password but not on the token — however, the token itself is a high-entropy random value, making rainbow table attacks infeasible.

**Q4: How does the failedQueue in the Axios interceptor prevent race conditions?**
A: When the first request detects a 401 TOKEN_EXPIRED, it sets `isRefreshing = true`. All subsequent 401 responses check `isRefreshing` and instead of triggering their own refresh, they push their resolve/reject into `failedQueue`. When the first refresh completes, it calls `processQueue(null, newToken)` which resolves all queued promises with the new token, allowing all waiting requests to retry with the fresh token.

**Q5: Why is the Socket.io auth middleware checking both `auth.token` and `headers['x-auth-token']`?**
A: The Socket.io client sends the token in the `auth` option during initial handshake. However, during reconnection or the custom `refresh_token` event, the token might be passed differently. Supporting both sources ensures compatibility across different connection scenarios.

**Q6: Explain the MongoDB compound index on `Notification({ recipientId, isRead, createdAt })`**
A: The most common notification query is "get unread notifications for this user, sorted by newest first." This compound index covers:
- Equality on `recipientId` (which user)
- Equality on `isRead` (only unread)
- Sort on `createdAt` (newest first)
MongoDB can satisfy the entire query from the index without touching documents (covered query).

**Q7: Why is the auth limit 10 requests per 15 minutes while global is 300?**
A: Auth endpoints (login, register, forgot password) are brute-force targets. 10 per 15 minutes means an attacker can only try 10 passwords per account per 15 minutes. Global API endpoints need higher limits for legitimate usage — 300 per 15 minutes is about 1 request every 3 seconds, which is reasonable for a single user.

**Q8: How does `app.set('trust proxy', 1)` affect rate limiting?**
A: Without this, Express sees Nginx's IP (172.x.x.x) as the client IP for every request, making rate limiting per-IP useless. With `trust proxy: 1`, Express trusts the first proxy in the chain (Nginx) and uses the `X-Forwarded-For` header to get the real client IP. This is critical because the rate limiter uses `req.ip` to identify clients.

**Q9: What's the difference between `response_format: json_schema` and `response_format: json_object`?**
A: `json_object` simply tells the model to output valid JSON, but doesn't enforce a specific structure. `json_schema` provides a strict schema that the model is forced to follow, including required fields, types, and additionalProperties constraints. This eliminates parsing errors where the model might omit fields or use wrong types.

**Q10: Why did you choose disk storage for Multer instead of memory storage?**
A: Memory storage buffers the entire file in RAM, which is problematic for large files and multiple concurrent uploads. Disk storage writes to the filesystem, which has essentially unlimited capacity. However, the trade-off is that disk I/O is slower and requires cleanup logic. A production improvement would be to stream directly to Cloudinary/S3.

**Q11: How does the subscription cron job handle edge cases?**
A: The daily cron job queries `Subscription.find({ status: 'Active', currentPeriodEnd: { $lte: new Date() } })` — this catches all subscriptions past their expiry date. It then sets `planId: 'Free'` and `status: 'Cancelled'`. The weekly cleanup job deletes read notifications older than 30 days using a similar date comparison.

**Q12: What happens if the NVIDIA NIM API call fails during background analysis?**
A: The error is caught in the try/catch of `analyzeResumeBackground`. The error is logged to console, and the application remains in the database without AI analysis. The candidate can manually request analysis later via the interactive endpoint. The circuit breaker tracks the failure and will eventually switch to mock mode.

**Q13: How do you ensure that a recruiter can only update applications for their own jobs?**
A: The `getJobApplications` and `updateApplicationStatus` controllers verify ownership by comparing `job.recruiterId.toString() !== req.user._id.toString()`. If they don't match, it returns a 403 Forbidden error. This is checked in addition to the RBAC `restrictTo('recruiter')` middleware.

**Q14: Why does the password reset clear the refreshToken?**
A: This is a security measure. If an attacker gains access to an account and changes the password, clearing the refreshToken invalidates all existing sessions, including any sessions the attacker might have established before the password change. This is a standard security practice called "session invalidation on password change."

**Q15: How would you handle 10,000 concurrent WebSocket connections?**
A: Node.js can handle this on a single server with proper configuration (increasing `max-old-space-size`, using clustering). For higher scale, I would use the Socket.io Redis adapter, which uses Redis pub/sub to broadcast messages across multiple Node.js instances. Each instance handles a subset of connections, and sticky sessions ensure the same client always hits the same instance.

**Q16: What's the purpose of the `$ne` in the mark_read Socket.io handler?**
A: `senderId: { $ne: socket.user._id }` ensures we only mark messages from the other user as read. We don't want to mark our own messages as read when we open the chat — that would incorrectly acknowledge our own messages as "seen."

**Q17: How would you prevent abuse of the AI features?**
A: By implementing per-user rate limits on AI endpoints, checking subscription tiers (Free users get limited AI calls per day), and adding cost monitoring with alerts when daily NVIDIA API spend exceeds a threshold.

**Q18: Explain the `hpp` middleware usage.**
A: HTTP Parameter Pollution is an attack where an attacker sends multiple parameters with the same name (e.g., `?role=admin&role=user`) to override expected values. The `hpp` middleware whitelists allowed duplicate parameters and rejects or deduplicates malicious ones.

**Q19: How does the `extractTextFromUrl` function work in `resumeService.js`?**
A: For the `existingResumeUrl` case (when the candidate selects a previously uploaded resume instead of uploading a new one), the service fetches the file from the stored URL, downloads it, extracts text using the same `fileParser.js` functions, and then cleans up the temporary download.

**Q20: Why is the backend restart not triggered on file changes in production?**
A: In production, the Docker container runs `node server.js` directly (no nodemon). File changes don't apply without rebuilding the image. For development, `nodemon server.js` watches for changes and auto-restarts. This separation ensures production stability while maintaining developer productivity.

---

## 36. Behavioral Questions with Sample Answers

**Q1: Tell me about a time you had to make a difficult technical decision.**
A: "Choosing between local file storage and Cloudinary for resume uploads. Local storage was simpler to implement and didn't require any third-party setup, but it doesn't scale horizontally — if I run multiple backend containers, files saved on one container aren't accessible to others. I chose local storage for the MVP because it let me ship faster and validate the core product. I documented this as a known limitation and planned to migrate to Cloudinary as the next step after launch. The trade-off was worth it — the MVP was ready in weeks instead of months."

**Q2: Describe a bug that took you a long time to fix.**
A: "The refresh token reuse detection was causing legitimate users to be logged out. The issue was a race condition: if the user made multiple API calls simultaneously right after the access token expired, each call would independently trigger a refresh. The second refresh would find the stored token already rotated by the first refresh and return 'Token reuse detected.' The fix was implementing the failedQueue pattern in the Axios interceptor — now only one refresh request ever happens at a time, and all other callers wait for that single refresh to complete."

**Q3: How do you handle disagreement with a team member about design?**
A: "In this project, I was the sole developer, but I simulate team collaboration by writing architecture decision records (ADRs). For example, when deciding between MongoDB and PostgreSQL, I documented both options with pros and cons, trade-offs, and the final decision rationale. This gives me a reference point if I need to revisit the decision later, and it helps onboard future contributors."

**Q4: Tell me about a time you failed at something.**
A: "My first attempt at refresh token rotation didn't hash the tokens in the database. I stored them in plain text. A week later, I realized that if the database was compromised, every user's session could be hijacked. I had to redesign the entire flow — adding SHA-256 hashing, updating the login, refresh, and logout endpoints, and invalidating all existing sessions. It was a painful lesson in security-by-default thinking. Now I always ask 'what's the worst-case scenario if this data is leaked?' before finalizing any design."

**Q5: How do you prioritize features?**
A: "I use the MoSCoW method. Must-haves: authentication, job posting, and application submission — without these, the platform doesn't function. Should-haves: AI analysis and mock interviews — these are the unique value propositions. Could-haves: real-time chat and career roadmaps — they enhance the experience but aren't critical. Won't-haves for now: CI/CD pipeline and automated testing — they're important but can wait until the product is validated."

---

## 37. STAR-Format Stories

**Situation**: The AI API was returning malformed JSON, crashing the resume analysis feature.

**Task**: Ensure reliable AI responses without breaking the user experience.

**Action**: I implemented three things: 1) Switched to `response_format: json_object` with detailed system prompt schemas which forces the model to conform to a strict JSON schema. 2) Added the circuit breaker pattern that falls back to mock data after 3 consecutive failures. 3) Made background analysis fire-and-forget so a failure never blocks the user's request.

**Result**: Zero crashes from malformed AI responses since the change. The circuit breaker has triggered twice during NVIDIA API outages, and the app remained fully functional with mock data both times. Users see analysis results instantly instead of waiting through retries.

---

**Situation**: Users reported being randomly logged out during normal usage.

**Task**: Fix the silent logout bug without compromising security.

**Action**: I identified the root cause as a race condition in the Axios interceptor. Multiple simultaneous 401 responses would all try to refresh the token simultaneously. The second refresh would find the stored hash didn't match the rotated hash and return "Token reuse detected." I implemented the failedQueue pattern: when the first 401 triggers a refresh, subsequent 401s queue their callbacks. When the refresh completes, all queued requests replay with the new token.

**Result**: Zero random logout reports since the fix. The queue pattern also improved perceived performance because users no longer experience delays from multiple refresh attempts.

---

## 38. Cheat Sheet (Memorize These Points Before the Interview)

**Key Metrics**:
- Access token: 15 minute expiry
- Refresh token: 7 day expiry, rotated on each use
- Refresh cookie: httpOnly, secure, sameSite:strict
- bcrypt cost factor: 12
- Auth rate limit: 10 req/15min
- Global rate limit: 300 req/15min
- Nginx rate limit: 10 req/s, burst 20
- File size limit: 5MB
- Body size limit: 100kb
- NVIDIA model: meta/llama-3.3-70b-instruct
- Circuit breaker: 3 failures → 60s cooldown
- Token expiry: 10 minutes for verification/reset
- Plans: Free, Pro (₹1500/mo), Premium (₹3900/mo)
- Subscription period: 30 days

**Key Architecture Points**:
- 3 Docker containers: backend (Node 18), frontend (Nginx), MongoDB 7
- 10 MongoDB collections, 11+ compound indexes
- 3 JWT tokens: access, refresh, verification/reset
- 3 roles: candidate, recruiter, admin
- 3-stage mock interview: create → questions → submit → complete
- 2-layer duplicate application detection: application-level + database unique index
- 11 AI functions, all with mock fallbacks
- 6 application statuses in pipeline
- Socket.io: JWT handshake auth + room-based notifications + Redis-ready

**Key Buzzwords to Use**:
- Refresh token rotation
- Circuit breaker pattern
- JSON mode (NVIDIA NIM)
- Token reuse detection
- Fire-and-forget pattern
- Graceful shutdown
- FailedQueue pattern
- Compound indexes
- Operational vs programming errors

---

## 39. Red Flags Interviewers May Ask About

**Red Flag 1: No automated tests**
- **Honest answer**: "This is a known gap. I prioritized feature development over testing for the MVP to validate the product-market fit. I would add Jest for backend integration tests and Vitest with React Testing Library for frontend component tests. Given the complexity of the auth flow and AI integration, these would be my highest priority test targets."

**Red Flag 2: No CI/CD pipeline**
- **Honest answer**: "The `.github/workflows` directory exists but is empty. Deployment is currently manual via Docker Compose on the VPS. I would implement a GitHub Actions workflow that runs linting and tests on PR, then builds and deploys on merge to main."

**Red Flag 3: No TypeScript**
- **Honest answer**: "I chose JavaScript for faster development iteration. The Zod validation layer provides runtime type safety for API inputs. For a production application, I would migrate to TypeScript incrementally, starting with the backend services layer."

**Red Flag 4: Refresh tokens in localStorage**
- **Honest answer**: "Access tokens are in localStorage for simplicity — they're short-lived (15 minutes). Refresh tokens are in httpOnly cookies, which are immune to XSS. The risk is limited because the access token window is small."

**Red Flag 5: No Redis caching**
- **Honest answer**: "Caching wasn't implemented because the MVP load doesn't justify the complexity. MongoDB's indexes keep most queries fast. For production scaling, Redis would be my first infrastructure addition — caching job listings and session data."

**Red Flag 6: Production environment variable handling**
- **Honest answer**: "The `.env` file is volume-mounted into the Docker container. For production, I would use Docker secrets or a secrets manager like HashiCorp Vault. The current approach is adequate for a small deployment but not enterprise-ready."

---

## 40. Full Mock Interview Script (30 Minutes)

**Interviewer**: "Welcome. Let's start with a simple one — walk me through what you built."

**Candidate**: "I built an AI-Powered Interview and Hiring Platform. It's a full-stack application where candidates can upload their resume, get AI-driven ATS analysis showing their match percentage and skill gaps, take mock interviews with questions generated by NVIDIA NIM and get scored answers with feedback, and receive a personalized career roadmap. Recruiters can post jobs, review applications with AI analysis, schedule interviews, and chat with candidates in real-time. The stack is React 19 with Vite and Tailwind CSS on the frontend, Node.js Express with MongoDB on the backend, Socket.io for real-time features, Razorpay for payments, NVIDIA NIM for AI features, and Docker for deployment."

**Interviewer**: "How does the authentication system work, specifically the refresh token rotation?"

**Candidate**: "We use a two-token JWT system. Access tokens expire in 15 minutes and are sent in the Authorization header. Refresh tokens expire in 7 days, are SHA-256 hashed and stored in the database, and are sent as httpOnly, secure, sameSite:strict cookies. When the access token expires, the frontend Axios interceptor catches the 401 with a TOKEN_EXPIRED code and automatically calls the refresh endpoint. The server verifies the refresh token signature, hashes it, compares it with the stored hash in the User document, and if it matches, generates new tokens. The old refresh token is invalidated, and the new one is stored and sent as a cookie. If the hash doesn't match, it means the token was already used — indicating it might have been stolen — so we reject with 'Token reuse detected.'"

**Interviewer**: "What if two API calls fail simultaneously with 401? Wouldn't that cause issues?"

**Candidate**: "Great question. The Axios interceptor handles this with a queue pattern. When the first 401 is detected, `isRefreshing` is set to true, and the refresh call is made. Any subsequent 401s check `isRefreshing` and instead of triggering their own refresh, they push their callbacks into a `failedQueue`. When the refresh completes successfully, we call `processQueue(null, newToken)` which resolves all queued promises with the new token, and each one retries its original request with the fresh token. This ensures exactly one refresh call happens at a time, preventing the race condition that would otherwise cause token reuse detection."

**Interviewer**: "Tell me about the NVIDIA NIM integration. How do you handle API failures?"

**Candidate**: "We use meta/llama-3.3-70b-instruct for cost efficiency with JSON mode — NVIDIA NIM's `response_format: json_object` feature paired with detailed system prompt schemas — which guarantees valid JSON matching our expected structure. For reliability, I implemented a circuit breaker pattern. The breaker tracks consecutive failures. After 3 failures, it opens for 60 seconds, during which all AI calls return realistic mock data instead of hitting the API. After the cooldown, it resets and tries real calls again. This prevents cascading failures, saves API costs during outages, and keeps the app functional even when NVIDIA NIM is down. Additionally, background AI tasks like the resume analysis after application submission are fire-and-forget, so a failure never blocks the user's HTTP response."

**Interviewer**: "How is the database designed? Why MongoDB?"

**Candidate**: "We have 10 collections. MongoDB was chosen for schema flexibility — the AI analysis results, career roadmaps, and user profiles have varying structures that don't fit relational tables well. The embedded document model works perfectly for mock interview questions within sessions. We use compound indexes extensively — for example, the unique compound index on Application's `{ jobId, candidateId }` prevents duplicate applications at the database level, which is more reliable than application-level checks. The Notification collection has a compound index on `{ recipientId, isRead, createdAt }` for efficient unread notification queries."

**Interviewer**: "Walk me through the mock interview feature end-to-end."

**Candidate**: "It's a four-step process. First, the user creates a session by uploading their resume and specifying a target role and difficulty level (easy, medium, or hard). The backend extracts text from the PDF or DOCX using pdf-parse or mammoth. Second, the user requests question generation — the AI creates 5 questions spanning Technical Skills, System Design, Problem Solving, Domain Knowledge, and Behavioral categories, each at the selected difficulty. Third, the user submits answers one at a time. Each answer is sent to NVIDIA NIM with a scoring rubric, and we get back a score out of 10, detailed feedback, strengths, and areas for improvement. Finally, when all questions are answered, the user completes the session. The AI generates overall feedback, we calculate a grade from A to D based on the percentage score, and we return top strengths and areas to improve."

**Interviewer**: "How would you scale this to handle 100,000 users?"

**Candidate**: "Several strategies. First, horizontal scaling of the backend — running multiple Node.js containers behind Nginx load balancing. For Socket.io, I'd add the Redis adapter so WebSocket messages broadcast across all instances. For MongoDB, a replica set for read scaling and sharding by userId for write scaling. I'd add a Redis caching layer for job listings and AI analysis results, reducing database load by an estimated 60%. File storage would move from local disk to Cloudinary or S3 since local storage doesn't work across multiple containers. I'd also implement cursor-based pagination for all list endpoints and add proper database projections to return only necessary fields."

**Interviewer**: "What's the biggest security vulnerability in your application?"

**Candidate**: "The most significant risk is the local file storage for uploaded resumes. In the current Docker setup, files are stored on a Docker volume shared across backend instances. If an attacker gains access to the server, they could access all uploaded resumes. The fix would be to move file storage to a secure cloud service like Cloudinary or S3 with signed URLs for access control. Another risk is the lack of input sanitization on the cover letter field in applications — while we have XSS-Clean middleware, a defense-in-depth approach would add HTML escaping on the frontend as well."

**Interviewer**: "What would you improve if you had another month?"

**Candidate**: "My top priorities would be: 1) Adding automated tests — Jest for backend, Vitest for frontend — starting with the auth flow and AI integration since those are the most critical paths. 2) Setting up a CI/CD pipeline with GitHub Actions for automated testing and deployment. 3) Implementing Redis caching for jobs and analyses. 4) Adding a proper monitoring and logging system with Winston and error tracking. 5) Implementing TypeScript for better maintainability. 6) Integrating with Cloudinary for production-grade file storage."

**Interviewer**: "Tell me about a bug that was particularly difficult to diagnose."

**Candidate**: "The refresh token reuse detection bug. Users were being randomly logged out during normal usage. I initially thought it was a token expiry issue, but the logs showed 'Token reuse detected.' After adding extensive logging, I realized the race condition: if a user's access token expired and they had multiple tabs open or made multiple simultaneous requests, each one would independently call the refresh endpoint. The first call would rotate the token in the database. The second call would find that the stored hash no longer matched the request's token and would reject. The fix was the Axios interceptor queue pattern — ensuring only one refresh happens at a time, with all other callers waiting for that single refresh to complete."

**Interviewer**: "How do you handle error responses differently in development vs production?"

**Candidate**: "In development, the global error handler returns the full error object with stack trace, error name, and all details — this helps with debugging. In production, we distinguish between operational errors (expected, like validation failures) and programming errors (unexpected bugs). Operational errors return a clean `{ status, message, code }` response. Programming errors return a generic 'Something went wrong internally' message without leaking any stack traces or internal details. We handle specific error types: MongoDB CastError for invalid ObjectIds, duplicate key errors (code 11000), validation errors, and JWT errors all get appropriate HTTP status codes and messages."

**Interviewer**: "What's the most important thing you learned building this?"

**Candidate**: "The importance of designing for failure from the start. The circuit breaker pattern for the AI backend, the fire-and-forget pattern for background analysis, the graceful shutdown handler, the token rotation with reuse detection — all of these are defensive patterns that assume things will go wrong. Building a production application isn't about handling the happy path; it's about gracefully handling every possible failure mode. This project taught me to always ask 'what happens if this API call fails?' and 'what happens if two users do this simultaneously?' before writing any production code."

**Interviewer**: "Why did you choose React 19 specifically?"

**Candidate**: "React 19 was the latest stable version when I started, and I wanted to use the most current APIs. The main benefits are the improved concurrent features, better automatic batching of state updates, and the new hooks like `use()` for reading resources. Combined with Vite for extremely fast HMR and Tailwind CSS for rapid styling, the developer experience is excellent. TanStack Query handles server state management with caching, background refetching, and optimistic updates out of the box — it's far better than managing loading/error states manually."

**Interviewer**: "How does the payment workflow protect against fraud?"

**Candidate**: "Three layers. First, when the frontend initiates a payment, it calls our server to create a Razorpay order — this sets the exact amount server-side, preventing the client from tampering with pricing. Second, after payment, the server verifies the HMAC SHA256 signature using our secret key — if the signature doesn't match, we reject. Third, Razorpay sends a server-to-server webhook for payment events, and that webhook also has signature verification. Even if a client tries to fake a successful payment response, the webhook verification won't match and we don't activate their subscription."

**Interviewer**: "Thank you. That's all the time we have."

**Candidate**: "Thank you for the thorough questions. I enjoyed discussing the architecture and design decisions."
