const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./middleware/errorHandler');
const authRouter = require('./routes/authRoutes');
const authLimiter = rateLimit({
  max: 10,
  windowMs: 15 * 60 * 1000,
  message: 'Too many authentication attempts. Please try again in 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});
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
const debugRouter = require('./routes/debugRoutes');
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

// Enable CORS with Credentials (essential for httpOnly cookies)
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS']
}));

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
app.use('/api/v1/auth', authLimiter);

// 2. Data Parsing Middlewares
app.use(express.json({ limit: '100kb' })); // Body parser
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(cookieParser()); // Cookie parser to process refresh cookies

// 3. Security Data Sanitization Middlewares
app.use(mongoSanitize()); // Prevent NoSQL query injection (e.g. email: { $ne: null })
app.use(xss()); // Invalidate cross-site scripting injection attempts in user inputs
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
app.use('/api/debug', debugRouter);

// 5. Unhandled Routes Catchall (404)
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 6. Centralized Global Error Handler
app.use(globalErrorHandler);

module.exports = app;
