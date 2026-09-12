export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  
  // Custom error parsing
  let message = err.message;
  let errors = null;

  // Handle Mongoose Bad Object ID (CastError)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    res.status(404);
    message = 'Resource not found';
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    res.status(400);
    message = 'Validation failed';
    errors = Object.values(err.errors).map(val => val.message);
  }

  // Handle Mongoose Duplicate Key Error
  if (err.code === 11000) {
    res.status(400);
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate field value entered: ${field}. Please use another value.`;
  }

  res.json({
    message,
    errors,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};
