const { validationResult } = require("express-validator");

// Place this after a set of express-validator rule chains in a route.
// If any rule failed, responds with 400 and a clean list of field errors.
// Otherwise, passes control to the next handler.
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }

  next();
};

module.exports = validateRequest;
