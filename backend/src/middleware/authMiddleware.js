const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verifies the JWT sent in the Authorization header.
// On success, attaches the logged-in user to req.user.
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Not authorized, no token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Not authorized, user not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Not authorized, invalid or expired token" });
  }
};

// Generic role guard. Use after `protect`.
// Example: authorizeRoles("admin") or authorizeRoles("admin", "customer")
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (req.user && allowedRoles.includes(req.user.role)) {
      return next();
    }
    return res.status(403).json({
      success: false,
      message: `Access denied. Requires role: ${allowedRoles.join(" or ")}`,
    });
  };
};

// Kept for backward compatibility with routes already using adminOnly (e.g. productRoutes.js).
// Internally just a fixed case of authorizeRoles.
const adminOnly = authorizeRoles("admin");

module.exports = { protect, adminOnly, authorizeRoles };
