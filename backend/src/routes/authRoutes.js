const express = require("express");
const { registerUser, loginUser, sendOtp, verifyOtp, getProfile } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { registerRules, loginRules } = require("../middleware/authValidators");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.post("/register", registerRules, validateRequest, registerUser);
router.post("/login", loginRules, validateRequest, loginUser);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.get("/profile", protect, getProfile);

// Note: OTP-based login/registration is planned for a later phase.
// Email + password auth is the foundation built here.

module.exports = router;
