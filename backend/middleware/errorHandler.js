const AppError = require('../utils/appError');

/**
 * Handles database cast errors (e.g. invalid MongoDB ObjectId)
 */
const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

/**
 * Handles database duplicate key errors (e.g. unique fields registration collisions)
 */
const handleDuplicateFieldsDB = err => {
  const keyValue = err.keyValue || {};
  const field = Object.keys(keyValue)[0] || 'field';
  const value = keyValue[field] || 'duplicate';
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

/**
 * Handles database schema validation errors
 */
const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * Handles JSON Web Token signature verification failures
 */
const handleJWTError = () => 
  new AppError('Invalid token signature. Please log in again.', 401);

/**
 * Handles JSON Web Token expiration failures
 */
const handleJWTExpiredError = () => 
  new AppError('Your token has expired! Please log in again.', 401);

/**
 * Send detailed stack traces in local development
 */
const sendErrorDev = (err, req, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

/**
 * Send clean operational error responses in production
 */
const sendErrorProd = (err, req, res) => {
  // 1. Operational, trusted error: send message to client
  if (err.isOperational) {
    const response = {
      status: err.status,
      message: err.message
    };
    if (err.code) response.code = err.code;
    return res.status(err.statusCode).json(response);
  }
  
  // 2. Programming or other unknown error: don't leak details to user
  console.error('ERROR 💥', err);
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong internally.'
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.create(Object.getPrototypeOf(err));
    for (const key of Object.getOwnPropertyNames(err)) {
      const desc = Object.getOwnPropertyDescriptor(err, key);
      if (desc) Object.defineProperty(error, key, desc);
    }
    if (error.statusCode === undefined) error.statusCode = err.statusCode;
    if (error.status === undefined) error.status = err.status;
    if (error.isOperational === undefined) error.isOperational = err.isOperational;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
