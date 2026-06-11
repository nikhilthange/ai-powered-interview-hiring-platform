/**
 * Custom operational error class for standardizing HTTP error status codes.
 * Implements standard JavaScript Error inheritance.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    // Flag to mark errors we know about and expect (validation, authentication)
    // versus unhandled node runtime errors or bugs.
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
