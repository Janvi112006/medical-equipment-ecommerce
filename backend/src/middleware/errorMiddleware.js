// Handles requests to routes that don't exist
const notFound = (req, res, next) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
};

// Catches errors thrown anywhere in the app and sends a clean JSON response
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Something went wrong on the server",
  });
};

module.exports = { notFound, errorHandler };
