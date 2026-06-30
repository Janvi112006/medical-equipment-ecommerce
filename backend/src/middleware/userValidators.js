const { body } = require("express-validator");

// Rules for PATCH /api/users/:id/role
const updateUserRoleRules = [
  body("role")
    .notEmpty()
    .withMessage("role is required")
    .isIn(["customer", "admin"])
    .withMessage("role must be either 'customer' or 'admin'"),
];

module.exports = { updateUserRoleRules };
