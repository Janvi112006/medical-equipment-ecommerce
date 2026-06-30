const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: { type: String, required: true }, // snapshot at time of order
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true }, // snapshot price at time of order
});

const orderHistorySchema = new mongoose.Schema({
  status: { type: String, required: true }, // snapshot of order.status at this point in time
  note: { type: String, default: "" },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null, // null = system-generated entry (e.g. automatic payment confirmation)
  },
  changedAt: { type: Date, default: Date.now },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      required: true,
      min: 0,
      default: 0, // placeholder — see TAX_RATE in .env.example
    },
    shippingAddress: {
      fullName: String,
      phone: String,
      addressLine: String,
      city: String,
      state: String,
      pincode: String,
    },
    // Fulfillment status — separate from payment.status below.
    // "confirmed" is set automatically once payment is verified (Phase 6 flow),
    // the rest are set by an admin via PATCH /api/orders/:id/status (Phase 7).
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "out_for_delivery", "delivered", "cancelled"],
      default: "pending",
    },
    // Razorpay payment details - populated once the payment module is built
    payment: {
      provider: { type: String, default: "razorpay" },
      razorpayOrderId: { type: String, default: null },
      razorpayPaymentId: { type: String, default: null },
      razorpaySignature: { type: String, default: null },
      status: {
        type: String,
        enum: ["unpaid", "paid", "failed"],
        default: "unpaid",
      },
      failureReason: { type: String, default: null },
    },
    // Tracking - provider not finalized yet (see TRACKING_API_BASE_URL/KEY in
    // .env.example); fetchTrackingStatus() in utils/trackingService.js
    // currently returns a mocked status until a real courier API is chosen.
    tracking: {
      provider: { type: String, default: null },
      trackingId: { type: String, default: null },
      trackingUrl: { type: String, default: null },
      status: {
        type: String,
        enum: ["not_shipped", "in_transit", "out_for_delivery", "delivered", "unknown"],
        default: "not_shipped",
      },
    },
    // Timeline of status changes — appended to on every status/tracking update
    history: {
      type: [orderHistorySchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
