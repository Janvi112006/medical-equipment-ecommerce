const { body } = require("express-validator");

// Rules for POST /api/cart/add
const addToCartRules = [
  body("productId").notEmpty().withMessage("productId is required").isMongoId().withMessage("productId must be a valid id"),

  body("quantity")
    .notEmpty()
    .withMessage("quantity is required")
    .isInt({ min: 1 })
    .withMessage("quantity must be a whole number of 1 or more"),
];

// Rules for PUT /api/cart/update
const updateCartRules = [
  body("productId").notEmpty().withMessage("productId is required").isMongoId().withMessage("productId must be a valid id"),

  body("quantity")
    .notEmpty()
    .withMessage("quantity is required")
    .isInt({ min: 1 })
    .withMessage("quantity must be a whole number of 1 or more (use the remove endpoint to delete an item)"),
];

module.exports = { addToCartRules, updateCartRules };
