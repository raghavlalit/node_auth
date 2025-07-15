/**
 * Global Error Handler Middleware
 * Handles all errors thrown in the application
 */

const errorHandler = (err, req, res, next) => {
  // Log error details
  console.error('[ERROR_HANDLER]', {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name,
      code: err.code
    }
  });

  // Default error response
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errorCode = 'INTERNAL_ERROR';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errorCode = 'VALIDATION_ERROR';
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
    errorCode = 'UNAUTHORIZED';
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403;
    message = 'Forbidden';
    errorCode = 'FORBIDDEN';
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
    message = 'Resource Not Found';
    errorCode = 'NOT_FOUND';
  } else if (err.name === 'ConflictError') {
    statusCode = 409;
    message = 'Resource Conflict';
    errorCode = 'CONFLICT';
  } else if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = 'Duplicate Entry';
    errorCode = 'DUPLICATE_ENTRY';
  } else if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    statusCode = 400;
    message = 'Invalid Reference';
    errorCode = 'INVALID_REFERENCE';
  } else if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    statusCode = 400;
    message = 'Cannot Delete Referenced Record';
    errorCode = 'REFERENCED_RECORD';
  } else if (err.code === 'ECONNREFUSED') {
    statusCode = 503;
    message = 'Database Connection Failed';
    errorCode = 'DB_CONNECTION_ERROR';
  } else if (err.code === 'ETIMEDOUT') {
    statusCode = 504;
    message = 'Request Timeout';
    errorCode = 'TIMEOUT';
  }

  // Handle Joi validation errors
  if (err.isJoi) {
    statusCode = 400;
    message = 'Validation Error';
    errorCode = 'VALIDATION_ERROR';
    
    return res.status(statusCode).json({
      success: 0,
      message: message,
      error: errorCode,
      details: err.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type
      }))
    });
  }

  // Handle custom API errors
  if (err.statusCode) {
    statusCode = err.statusCode;
    message = err.message || message;
    errorCode = err.errorCode || errorCode;
  }

  // Prepare error response
  const errorResponse = {
    success: 0,
    message: message,
    error: errorCode,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  };

  // Add error details in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
    errorResponse.details = err.message;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

export default errorHandler; 