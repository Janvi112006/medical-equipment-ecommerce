const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/emailService");

// POST /api/auth/register
// Field-level validation (name/email/password/phone) is handled by
// registerRules + validateRequest middleware before this runs.
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // role is intentionally NOT taken from req.body — every new account is
    // created as "customer". Promoting a user to "admin" is a separate,
    // deliberate action (currently done directly in the database; see README).
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    const token = generateToken(user._id, user.role);
await sendEmail({
  to: user.email,
  subject: "Welcome to MedEquip",
  text: `Hi ${user.name},

Welcome to MedEquip!

Your account has been created successfully.

Thank you for choosing MedEquip.`,
});

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
// Field-level validation (email/password) is handled by
// loginRules + validateRequest middleware before this runs.
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/profile  (protected)
const getProfile = async (req, res, next) => {
  try {
    // req.user is set by the `protect` middleware
    res.status(200).json({ success: true, data: req.user });
  } catch (error) {
    next(error);
  }
};

module.exports = { registerUser, loginUser, getProfile };
