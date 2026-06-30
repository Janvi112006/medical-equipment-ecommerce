const { body } = require("express-validator");

// Rules for POST /api/products (all fields required)
const createProductRules = [
  body("name").trim().notEmpty().withMessage("Product name is required"),

  body("description").trim().notEmpty().withMessage("Product description is required"),

  body("category").trim().notEmpty().withMessage("Category is required"),

  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock must be a whole number of 0 or more"),

  body("images")
    .optional()
    .isArray()
    .withMessage("Images must be an array of URL/path strings"),

  body("images.*")
    .optional()
    .isString()
    .withMessage("Each image entry must be a string (URL or path)")
    .notEmpty()
    .withMessage("Image entries cannot be empty strings"),
];

// Rules for PUT /api/products/:id (all fields optional, but must be valid if present)
const updateProductRules = [
  body("name").optional().trim().notEmpty().withMessage("Product name cannot be empty"),

  body("description").optional().trim().notEmpty().withMessage("Description cannot be empty"),

  body("category").optional().trim().notEmpty().withMessage("Category cannot be empty"),

  body("price").optional().isFloat({ min: 0 }).withMessage("Price must be a positive number"),

  body("stock").optional().isInt({ min: 0 }).withMessage("Stock must be a whole number of 0 or more"),

  body("images").optional().isArray().withMessage("Images must be an array of URL/path strings"),

  body("images.*")
    .optional()
    .isString()
    .withMessage("Each image entry must be a string (URL or path)")
    .notEmpty()
    .withMessage("Image entries cannot be empty strings"),
];

// Rules for PATCH /api/products/:id/stock
const updateStockRules = [
  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("stock must be a whole number of 0 or more"),

  body("adjust")
    .optional()
    .isInt()
    .withMessage("adjust must be a whole number (positive to add, negative to subtract)"),
];

module.exports = { createProductRules, updateProductRules, updateStockRules };
