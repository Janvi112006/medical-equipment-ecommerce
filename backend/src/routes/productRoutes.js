const express = require("express");
const {
  getProducts,
  getCategories,
  getProductById,
  createProduct,
  updateProduct,
  updateStock,
  deleteProduct,
} = require("../controllers/productController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  createProductRules,
  updateProductRules,
  updateStockRules,
} = require("../middleware/productValidators");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

// Public routes - anyone can browse the catalog
// NOTE: "/categories" must be declared BEFORE "/:id" or Express would treat
// "categories" as a product id and route it to getProductById instead.
router.get("/categories", getCategories);
router.get("/", getProducts);
router.get("/:id", getProductById);

// Admin-only routes - require login + admin role
router.post("/", protect, adminOnly, createProductRules, validateRequest, createProduct);
router.put("/:id", protect, adminOnly, updateProductRules, validateRequest, updateProduct);
router.patch("/:id/stock", protect, adminOnly, updateStockRules, validateRequest, updateStock);
router.delete("/:id", protect, adminOnly, deleteProduct);

module.exports = router;
