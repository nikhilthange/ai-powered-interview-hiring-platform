# AI-Powered Interview & Hiring Platform - Backend Service Architecture
> **Senior Engineer Note:** Keep controllers thin and services thick. Controllers should only be responsible for parsing HTTP inputs, running schema validations, delegating actions to the Service layer, and returning the standardized API responses. This makes code unit-testable and decoupled from Express runtime constraints.

---

## 1. RESTful API Endpoints Map

| Method | Endpoint | Description | Middleware / Roles |
|:---|:---|:---|:---|
| **POST** | `/api/v1/auth/register` | Register new User | Public, Validation |
| **POST** | `/api/v1/auth/login` | Login user, set Refresh Cookie | Public, Validation, Auth Rate Limit |
| **POST** | `/api/v1/auth/refresh` | Rotate Access Token | Cookie presence verification |
| **POST** | `/api/v1/auth/logout` | Invalidate tokens, clear Cookie | JWT Protect |
| **GET** | `/api/v1/jobs` | Query matching jobs (Paginated, Search) | Public / JWT optional |
| **POST** | `/api/v1/jobs` | Post a job listing | JWT Protect, Role: `recruiter`, `admin` |
| **POST** | `/api/v1/jobs/:id/apply` | Apply to a job, upload resume | JWT Protect, Role: `candidate`, Multer |
| **GET** | `/api/v1/applications/recruiter` | Fetch incoming applications | JWT Protect, Role: `recruiter` |
| **PATCH** | `/api/v1/applications/:id/status`| Update application status | JWT Protect, Role: `recruiter` |
| **POST** | `/api/v1/interviews/schedule` | Schedule an interview (Google Meet) | JWT Protect, Role: `recruiter` |
| **POST** | `/api/v1/ai/analyze-resume` | Run AI ATS Analysis on Resume | JWT Protect, Role: `candidate`, AI Rate Limit |
| **POST** | `/api/v1/payments/subscribe` | Initialize Razorpay Order | JWT Protect |
| **POST** | `/api/v1/payments/webhook` | Verify webhooks from Razorpay | Raw Body Parser, Razorpay Signature Check |

---

## 2. Core Middleware Implementations

### 2.1 JWT Verification & Extraction Middleware (`middleware/authMiddleware.js`)
We decode the Bearer JWT and check user status. If the access token is expired, we send a distinct code (`TOKEN_EXPIRED`) to let the React client auto-trigger token refresh.

```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ status: 'fail', message: 'Not authenticated. Please log in.' });
    }

    // Verify token signature
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({ status: 'fail', message: 'User belonging to this token no longer exists.' });
    }

    // Assign user to request object
    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'fail',
        code: 'TOKEN_EXPIRED',
        message: 'Your session has expired. Please refresh your token.'
      });
    }
    return res.status(401).json({ status: 'fail', message: 'Invalid token signature.' });
  }
};

// Role-based restrictor middleware
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action.'
      });
    }
    next();
  };
};

module.exports = { protect, restrictTo };
```

### 2.2 Zod Input Validation Middleware (`middleware/validator.js`)
Prevents garbage data from reaching database layers. Returns structured field-level error messages to the frontend.

```javascript
const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    return res.status(400).json({
      status: 'fail',
      message: 'Validation failed',
      errors: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    });
  }
};

module.exports = validate;
```

---

## 3. Centralized Controller & Error Framework

### 3.1 Async Route Wrapper (`utils/asyncHandler.js`)
Eliminates repeating `try/catch` blocks across controller methods.

```javascript
module.exports = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
```

### 3.2 Global Error Handler Middleware (`middleware/errorHandler.js`)
Standardizes internal errors and prevents stack-trace leakage in production environment.

```javascript
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err
    });
  } else {
    // Production: Hide raw details if they are not operational
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    } else {
      // Log critical bugs internally
      console.error('CRITICAL SYSTEM BUG:', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong internally. Please contact support.'
      });
    }
  }
};

module.exports = globalErrorHandler;
```

---

## 4. Sample Controller & Service Logic: Job Applications
Shows the separation of database calls and third-party functions into the Service Layer.

### 4.1 Application Controller (`controllers/applicationController.js`)
```javascript
const asyncHandler = require('../utils/asyncHandler');
const applicationService = require('../services/applicationService');

exports.submitApplication = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const candidateId = req.user._id;
  
  // File URL set by Multer and Cloudinary uploader middleware
  const resumeUrl = req.file ? req.file.path : null; 
  if (!resumeUrl) {
    return res.status(400).json({ status: 'fail', message: 'Please upload a resume.' });
  }

  const application = await applicationService.createApplication({
    jobId,
    candidateId,
    resumeUrl,
    coverLetter: req.body.coverLetter
  });

  res.status(201).json({
    status: 'success',
    data: { application }
  });
});
```

### 4.2 Application Service Layer (`services/applicationService.js`)
```javascript
const Application = require('../models/Application');
const Job = require('../models/Job');
const aiService = require('./aiService');
const emailService = require('./emailService');

exports.createApplication = async (applicationData) => {
  // 1. Verify Job exists and is open
  const job = await Job.findById(applicationData.jobId);
  if (!job || job.status !== 'Active') {
    throw new Error('This job listing is closed or does not exist.');
  }

  // 2. Insert Application into Database
  const application = await Application.create(applicationData);

  // 3. (Async Async-Worker style) Run AI ATS Analysis
  // Don't await this synchronously if it blocks HTTP response, run in background
  aiService.analyzeResumeBackground(application._id, application.resumeUrl, job.description);

  // 4. Send Confirmation Emails
  await emailService.sendApplicationConfirmation({
    email: applicationData.email,
    jobTitle: job.title
  });

  return application;
};
```
