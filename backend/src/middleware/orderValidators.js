const { body } = require("express-validator");

const ORDER_STATUSES = ["pending", "confirmed", "shipped", "out_for_delivery", "delivered", "cancelled"];

// Rules for PATCH /api/orders/:id/status
const updateOrderStatusRules = [
  body("status")
    .notEmpty()
    .withMessage("status is required")
    .isIn(ORDER_STATUSES)
    .withMessage(`status must be one of: ${ORDER_STATUSES.join(", ")}`),

  body("note").optional().trim().isString().withMessage("note must be a string"),
];

// Rules for PATCH /api/orders/:id/tracking
const updateTrackingRules = [
  body("provider").trim().notEmpty().withMessage("provider is required (e.g. 'Shiprocket', 'Delhivery')"),

  body("trackingId").trim().notEmpty().withMessage("trackingId is required"),

  body("trackingUrl").optional().trim().isString().withMessage("trackingUrl must be a string"),
];

module.exports = { updateOrderStatusRules, updateTrackingRules, ORDER_STATUSES };
