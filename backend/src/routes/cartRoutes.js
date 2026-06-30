const express = require("express");
const { getCart, addToCart, updateCartItem, removeCartItem } = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");
const { addToCartRules, updateCartRules } = require("../middleware/cartValidators");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

// Every cart route requires a logged-in user (customer or admin — cart is per-account)
router.get("/", protect, getCart);
router.post("/add", protect, addToCartRules, validateRequest, addToCart);
router.put("/update", protect, updateCartRules, validateRequest, updateCartItem);
router.delete("/remove/:productId", protect, removeCartItem);

module.exports = router;
