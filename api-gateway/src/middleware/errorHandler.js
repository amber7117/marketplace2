const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error('API Gateway Error:', err);

  // Default error
  let statusCode = 500;
  let message = 'Internal Server Error';

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Service unavailable errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    statusCode = 503;
    message = 'Service temporarily unavailable';
  }

  // Request timeout
  if (err.code === 'ETIMEDOUT') {
    statusCode = 408;
    message = 'Request timeout';
  }

  // Rate limit exceeded
  if (err.status === 429) {
    statusCode = 429;
    message = 'Too many requests';
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;