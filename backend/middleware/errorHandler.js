const errorHandler = (error, req, res, next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Server error';

  if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource ID';
  }

  if (error.code === 11000) {
    statusCode = 409;
    message = 'The value already exists';
  }

  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(error.errors).map((item) => item.message).join(', ');
  }

  res.status(statusCode).json({ success: false, message });
};

module.exports = errorHandler;
