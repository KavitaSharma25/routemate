/**
 * Global error handler middleware
 * Catches and logs errors, returns 500 status with error message
 */
exports.errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server Error' });
};
