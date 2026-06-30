const express = require("express");
const { createAddress, getAddresses, deleteAddress } = require("../controllers/addressController");
const { protect } = require("../middleware/authMiddleware");
const { createAddressRules } = require("../middleware/addressValidators");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.post("/", protect, createAddressRules, validateRequest, createAddress);
router.get("/", protect, getAddresses);
router.delete("/:id", protect, deleteAddress);

module.exports = router;
