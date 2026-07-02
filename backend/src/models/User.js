const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      // Used for OTP-based login in a later phase. Not required yet.
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    // Placeholder for future OTP verification flow (Phase: Auth enhancement)
    isVerified: {
      type: Boolean,
      default: false,
    },
otpCode: {
  type: String,
  default: null,
},
otpExpiresAt: {
  type: Date,
  default: null,
},
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
