const AppError = require('../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  const keyValue = err.keyValue || {};
  const field = Object.keys(keyValue)[0] || 'field';
  const value = keyValue[field] || 'duplicate';
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token signature. Please log in again.', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

const handleMulterError = (err) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return new AppError('File too large. Maximum size is 5MB.', 400);
  }
  return new AppError(err.message || 'File upload error.', 400);
};

const sendErrorJSON = (err, req, res) => {
  const response = {
    success: false,
    message: err.isOperational ? err.message : 'Something went wrong internally.',
    statusCode: err.statusCode || 500
  };
  if (err.code) response.code = err.code;
  if (err.errors) response.errors = err.errors;
  if (process.env.NODE_ENV === 'development' && !err.isOperational) {
    response.error = err.stack || err.message;
  }
  return res.status(err.statusCode || 500).json(response);
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  if (err.name === 'MulterError') {
    err = handleMulterError(err);
  } else if (err.name === 'CastError') {
    err = handleCastErrorDB(err);
  } else if (err.code === 11000) {
    err = handleDuplicateFieldsDB(err);
  } else if (err.name === 'ValidationError') {
    err = handleValidationErrorDB(err);
  } else if (err.name === 'JsonWebTokenError') {
    err = handleJWTError();
  } else if (err.name === 'TokenExpiredError') {
    err = handleJWTExpiredError();
  }

  sendErrorJSON(err, req, res);
};
