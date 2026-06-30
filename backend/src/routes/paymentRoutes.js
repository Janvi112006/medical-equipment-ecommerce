const express = require("express");
const { createRazorpayOrder, verifyPayment, paymentFailed } = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");
const { createOrderRules, verifyPaymentRules, paymentFailureRules } = require("../middleware/paymentValidators");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.post("/create-order", protect, createOrderRules, validateRequest, createRazorpayOrder);
router.post("/verify", protect, verifyPaymentRules, validateRequest, verifyPayment);
router.post("/failure", protect, paymentFailureRules, validateRequest, paymentFailed);

// Stripe and PayPal are placeholders only for now (see .env.example) —
// no routes/controllers for them in this phase, per project scope.

module.exports = router;
