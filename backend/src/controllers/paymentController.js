const crypto = require("crypto");
const razorpayInstance = require("../config/razorpay");
const Order = require("../models/Order");
const addHistoryEntry = require("../utils/addHistoryEntry");
const notifyOrderStatusChange = require("../utils/notifyOrderStatusChange");

// POST /api/payments/create-order
// Body validation (orderId) handled by createOrderRules + validateRequest.
// Creates a Razorpay order for an existing internal Order, and stores the
// Razorpay order id on it so /verify can later confirm payment for it.
const createRazorpayOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.payment.status === "paid") {
      return res.status(400).json({ success: false, message: "This order has already been paid for" });
    }

    // Razorpay expects amount in the smallest currency unit (paise for INR)
    const amountInPaise = Math.round(order.totalAmount * 100);

    let razorpayOrder;
    try {
      razorpayOrder = await razorpayInstance.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: order._id.toString(),
      });
    } catch (razorpayError) {
      // Razorpay SDK errors carry a nested .error.description in most cases
      const message =
        (razorpayError && razorpayError.error && razorpayError.error.description) ||
        razorpayError.message ||
        "Failed to create Razorpay order";
      return res.status(502).json({ success: false, message });
    }

    // Fresh payment attempt — reset any previous failure state
    order.payment.razorpayOrderId = razorpayOrder.id;
    order.payment.status = "unpaid";
    order.payment.failureReason = null;
    order.payment.razorpaySignature = null;
    order.payment.razorpayPaymentId = null;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Razorpay order created",
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: amountInPaise,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID, // public key id, safe to send to the frontend checkout widget
        internalOrderId: order._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/payments/verify
// Body validation handled by verifyPaymentRules + validateRequest.
// Verifies the Razorpay checkout signature server-side before trusting that
// a payment actually succeeded. This is the step that prevents a client
// from just claiming "payment done" without real proof.
const verifyPayment = async (req, res, next) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.payment.status === "paid") {
      return res.status(200).json({ success: true, message: "Order already verified and paid", data: order });
    }

    if (order.payment.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "razorpay_order_id does not match this order's active payment session",
      });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      order.payment.status = "failed";
      order.payment.failureReason = "Signature verification failed";
      addHistoryEntry(order, order.status, "Payment signature verification failed", null);
      await order.save();

      return res.status(400).json({ success: false, message: "Payment verification failed: invalid signature" });
    }

    // Signature is valid — payment is confirmed genuine
    order.payment.status = "paid";
    order.payment.razorpayPaymentId = razorpay_payment_id;
    order.payment.razorpaySignature = razorpay_signature;
    order.payment.failureReason = null;

    const previousStatus = order.status;
    order.status = "confirmed"; // payment verified -> order moves from "pending" to "confirmed"
    addHistoryEntry(order, "confirmed", "Payment verified successfully via Razorpay", null);
    await order.save();

    notifyOrderStatusChange(order, previousStatus, order.status); // placeholder — see utils/notifyOrderStatusChange.js

    res.status(200).json({ success: true, message: "Payment verified successfully", data: order });
  } catch (error) {
    next(error);
  }
};

// POST /api/payments/failure
// Body validation handled by paymentFailureRules + validateRequest.
// Called by the frontend when the user cancels checkout or Razorpay reports
// a failed payment, so the order's payment state reflects reality instead
// of sitting silently as "unpaid" forever.
const paymentFailed = async (req, res, next) => {
  try {
    const { orderId, reason } = req.body;

    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.payment.status = "failed";
    order.payment.failureReason = reason || "Payment failed or was cancelled by the user";
    addHistoryEntry(order, order.status, order.payment.failureReason, null);
    await order.save();

    res.status(200).json({ success: true, message: "Payment failure recorded", data: order });
  } catch (error) {
    next(error);
  }
};

module.exports = { createRazorpayOrder, verifyPayment, paymentFailed };
