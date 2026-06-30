const { body } = require("express-validator");

// Rules for POST /api/addresses
const createAddressRules = [
  body("fullName").trim().notEmpty().withMessage("Full name is required"),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .isLength({ min: 7, max: 15 })
    .withMessage("Phone number must be between 7 and 15 digits")
    .isNumeric()
    .withMessage("Phone number must contain only digits"),

  body("addressLine").trim().notEmpty().withMessage("Address line is required"),

  body("city").trim().notEmpty().withMessage("City is required"),

  body("state").trim().notEmpty().withMessage("State is required"),

  body("pincode")
    .trim()
    .notEmpty()
    .withMessage("Pincode is required")
    .isLength({ min: 4, max: 10 })
    .withMessage("Pincode must be between 4 and 10 characters"),

  body("country").optional().trim().notEmpty().withMessage("Country cannot be empty if provided"),
];

module.exports = { createAddressRules };
