const express = require("express");
const { getUsers, updateUserRole } = require("../controllers/userController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { updateUserRoleRules } = require("../middleware/userValidators");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.get("/", protect, adminOnly, getUsers);
router.patch("/:id/role", protect, adminOnly, updateUserRoleRules, validateRequest, updateUserRole);

module.exports = router;
