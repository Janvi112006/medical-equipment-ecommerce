const express = require("express");
const {
  getMyOrders,
  adminGetOrders,
  getOrderById,
  updateOrderStatus,
  getOrderTracking,
  updateOrderTracking,
} = require("../controllers/orderController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { updateOrderStatusRules, updateTrackingRules } = require("../middleware/orderValidators");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

// NOTE on order: "/my" MUST be declared before "/:id", or Express would
// treat "my" as an order id and route it to getOrderById instead.
router.get("/my", protect, getMyOrders);
router.get("/", protect, adminOnly, adminGetOrders);
router.get("/:id", protect, getOrderById);
router.get("/:id/tracking", protect, getOrderTracking);
router.patch("/:id/status", protect, adminOnly, updateOrderStatusRules, validateRequest, updateOrderStatus);
router.patch("/:id/tracking", protect, adminOnly, updateTrackingRules, validateRequest, updateOrderTracking);

module.exports = router;
