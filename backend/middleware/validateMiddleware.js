const { validationResult } = require('express-validator');

/**
 * Run validation middleware
 * Checks express-validator results and returns errors if validation fails
 */
exports.runValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
