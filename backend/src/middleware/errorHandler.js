const fs = require('fs');
const path = require('path');

class CustomError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Helper function to log errors to file
const logErrorToFile = (err, req) => {
  const logsDir = path.join(__dirname, '../../logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  const errorLogPath = path.join(logsDir, 'error.log');
  const timestamp = new Date().toISOString();
  const errorLog = `
[${timestamp}]
Method: ${req.method}
URL: ${req.originalUrl}
Status: ${err.statusCode || 500}
Message: ${err.message}
Stack: ${err.stack}
User: ${req.user ? req.user.id : 'Not authenticated'}
Body: ${JSON.stringify(req.body, null, 2)}
-----------------------------------------------------------
`;

  fs.appendFileSync(errorLogPath, errorLog);
};

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log all errors to file
  try {
    logErrorToFile(err, req);
  } catch (logError) {
    console.error('Failed to log error to file:', logError);
  }

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      console.error('ERROR:', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong',
      });
    }
  }
};

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = { CustomError, errorHandler, asyncHandler };
