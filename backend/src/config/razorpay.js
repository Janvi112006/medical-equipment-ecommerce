const Razorpay = require("razorpay");

// A single shared Razorpay client, configured from .env.
// key_id/key_secret are only validated by Razorpay's API when actually
// called (e.g. orders.create), not at instantiation time.
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = razorpayInstance;
