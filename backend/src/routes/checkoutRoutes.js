const express = require("express");
const { checkout } = require("../controllers/checkoutController");
const { protect } = require("../middleware/authMiddleware");
const { checkoutRules } = require("../middleware/checkoutValidators");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.post("/", protect, checkoutRules, validateRequest, checkout);

module.exports = router;
