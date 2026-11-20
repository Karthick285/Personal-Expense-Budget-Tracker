function errorHandler(err, req, res, next) {
  console.error('[Unhandled Error]:', err);

  // If already responded
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.status || err.statusCode || 500;
  let userMessage = err.message || 'An unexpected server error occurred. Please try again.';

  // Mask database errors
  if (err.code && (err.code.startsWith('ER_') || err.code === 'ECONNREFUSED')) {
    statusCode = 500;
    userMessage = 'A database communication issue occurred. Please try again later.';
  }

  res.status(statusCode).json({
    success: false,
    message: userMessage,
    ...(process.env.NODE_ENV === 'development' ? { errorType: err.name } : {})
  });
}

module.exports = errorHandler;
