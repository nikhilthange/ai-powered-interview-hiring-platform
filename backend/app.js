const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./middleware/errorHandler');
const authRouter = require('./routes/authRoutes');
const jobRouter = require('./routes/jobRoutes');
const profileRouter = require('./routes/profileRoutes');
const applicationRouter = require('./routes/applicationRoutes');
const interviewRouter = require('./routes/interviewRoutes');
const chatRouter = require('./routes/chatRoutes');
const paymentRouter = require('./routes/paymentRoutes');
const adminRouter = require('./routes/adminRoutes');
const notificationRouter = require('./routes/notificationRoutes');
const savedJobRouter = require('./routes/savedJobRoutes');
const analysisRouter = require('./routes/analysisRoutes');
const aiChatRouter = require('./routes/aiChatRoutes');
const recruiterAIRouter = require('./routes/recruiterAIRoutes');
const debugRouter = require('./routes/debugRoutes');
const companyRouter = require('./routes/companyRoutes');
const resumeBuilderRouter = require('./routes/resumeBuilderRoutes');
const path = require('path');

const app = express();

// Trust proxy for correct client IP behind Nginx (required by rate limiter)
app.set('trust proxy', 1);

// 1. Configure Global Security Middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", "ws:", "wss:"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    }
  }
})); // HTTP headers safety guards

const allowedOrigins = [
  'http://localhost:5173',
  'https://hiremate-portal.vercel.app'
];
if (process.env.FRONTEND_URL && !allowedOrigins.includes(process.env.FRONTEND_URL)) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

// Enable CORS with Credentials (essential for httpOnly cookies)
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS']
}));

// Compress all JSON/API responses (gzip)
app.use(compression());

// Request logger for local development debugging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Global Rate Limiter to protect against DDoS
const globalLimiter = rateLimit({
  max: 300,
  windowMs: 15 * 60 * 1000,
  message: 'Too many requests from this IP. Please try again in 15 minutes.'
});
app.use('/api', globalLimiter);

// 2. Data Parsing Middlewares
app.use(express.json({ limit: '100kb' })); // Body parser
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(cookieParser()); // Cookie parser to process refresh cookies

// 3. Security Data Sanitization Middlewares
app.use(mongoSanitize()); // Prevent NoSQL query injection (e.g. email: { $ne: null })

// Recursively sanitize all string values in req.body, req.query, req.params against XSS
function sanitizeObject(val) {
  if (Array.isArray(val)) return val.map(sanitizeObject);
  if (typeof val === 'object' && val !== null) {
    const out = {};
    for (const key of Object.keys(val)) out[key] = sanitizeObject(val[key]);
    return out;
  }
  if (typeof val === 'string') return xss(val);
  return val;
}

const xssSanitizer = (req, res, next) => {
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);
  next();
};
app.use(xssSanitizer);

app.use(hpp()); // Prevent HTTP Parameter Pollution

// Serve uploaded files (resumes, avatars)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4. API Routes Mapping
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/jobs', jobRouter);
app.use('/api/v1/profiles', profileRouter);
app.use('/api/v1/applications', applicationRouter);
app.use('/api/v1/interviews', interviewRouter);
app.use('/api/v1/chats', chatRouter);
app.use('/api/v1/payments', paymentRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/saved-jobs', savedJobRouter);
app.use('/api/v1/analysis', analysisRouter);
app.use('/api/v1/ai-chat', aiChatRouter);
app.use('/api/v1/recruiter-ai', recruiterAIRouter);
app.use('/api/v1/companies', companyRouter);
app.use('/api/v1/resume-builder', resumeBuilderRouter);
app.use('/api/debug', debugRouter);

// 5. Unhandled Routes Catchall (404)
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 6. Centralized Global Error Handler
app.use(globalErrorHandler);

module.exports = app;
