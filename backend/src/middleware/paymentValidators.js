const { body } = require("express-validator");

// Rules for POST /api/payments/create-order
const createOrderRules = [
  body("orderId").notEmpty().withMessage("orderId is required").isMongoId().withMessage("orderId must be a valid id"),
];

// Rules for POST /api/payments/verify
const verifyPaymentRules = [
  body("orderId").notEmpty().withMessage("orderId is required").isMongoId().withMessage("orderId must be a valid id"),

  body("razorpay_order_id").trim().notEmpty().withMessage("razorpay_order_id is required"),

  body("razorpay_payment_id").trim().notEmpty().withMessage("razorpay_payment_id is required"),

  body("razorpay_signature").trim().notEmpty().withMessage("razorpay_signature is required"),
];

// Rules for POST /api/payments/failure
const paymentFailureRules = [
  body("orderId").notEmpty().withMessage("orderId is required").isMongoId().withMessage("orderId must be a valid id"),

  body("reason").optional().trim().isString().withMessage("reason must be a string"),
];

module.exports = { createOrderRules, verifyPaymentRules, paymentFailureRules };
