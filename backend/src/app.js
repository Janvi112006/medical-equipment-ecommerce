const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const addressRoutes = require("./routes/addressRoutes");
const checkoutRoutes = require("./routes/checkoutRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

// Core middleware
// CORS_ORIGIN: comma-separated list of allowed origins for production
// (e.g. "https://medequip.com,https://admin.medequip.com"). If unset
// (the default in .env.example), all origins are allowed — fine for local
// development, but should always be restricted in production. See the
// Security Recommendations in docs/Phase-11_Testing_QA_Deployment.md.
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  : true; // true = reflect any origin (cors package's "allow all" behavior)

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use(morgan("dev")); // request logging, helpful while learning/debugging

// Health check - useful to confirm the server is alive
app.get("/", (req, res) => {
  res.status(200).json({ message: "Medical Equipment E-commerce API is running" });
});

// Feature routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);

// Push notification (Firebase) wiring will be added in a later phase —
// see utils/notifyOrderStatusChange.js for the placeholder already in place.

// Error handling (must stay after all routes)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
