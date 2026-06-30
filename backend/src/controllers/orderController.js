const mongoose = require("mongoose");
const Order = require("../models/Order");
const addHistoryEntry = require("../utils/addHistoryEntry");
const notifyOrderStatusChange = require("../utils/notifyOrderStatusChange");
const fetchTrackingStatus = require("../utils/trackingService");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET /api/orders/my
// Returns the logged-in user's own orders. Supports ?status=&page=&limit=
const getMyOrders = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/orders  (admin only)
// All orders across all customers. Supports ?status=&user=&page=&limit=
const adminGetOrders = async (req, res, next) => {
  try {
    const { status, user } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (user && isValidId(user)) filter.user = user;

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(filter).populate("user", "name email").sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/:id
// Owner can view their own order; admin can view any order.
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: "Invalid order id" });
    }

    const order = await Order.findById(id).populate("user", "name email");
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const isOwner = order.user._id.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied. This is not your order." });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/orders/:id/status  (admin only)
// Body validation (status, note) handled by updateOrderStatusRules + validateRequest.
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: "Invalid order id" });
    }

    const { status, note } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const previousStatus = order.status;
    order.status = status;
    addHistoryEntry(order, status, note || `Status updated to "${status}" by admin`, req.user._id);
    await order.save();

    notifyOrderStatusChange(order, previousStatus, status); // placeholder — see utils/notifyOrderStatusChange.js

    res.status(200).json({ success: true, message: "Order status updated", data: order });
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/:id/tracking
// Owner or admin. Refreshes the mocked tracking status (see utils/trackingService.js)
// if a trackingId has already been set.
const getOrderTracking = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: "Invalid order id" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const isOwner = order.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied. This is not your order." });
    }

    if (order.tracking.trackingId) {
      const result = await fetchTrackingStatus({
        provider: order.tracking.provider,
        trackingId: order.tracking.trackingId,
      });

      if (result.status !== order.tracking.status) {
        const previousStatus = order.status;
        order.tracking.status = result.status;
        if (result.trackingUrl) order.tracking.trackingUrl = result.trackingUrl;
        addHistoryEntry(
          order,
          order.status,
          `Tracking status updated to "${result.status}" (via ${order.tracking.provider || "tracking provider"})`,
          null
        );
        await order.save();
        notifyOrderStatusChange(order, previousStatus, order.status);
      }
    }

    res.status(200).json({
      success: true,
      data: { orderId: order._id, orderStatus: order.status, tracking: order.tracking },
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/orders/:id/tracking  (admin only)
// Body validation (provider, trackingId, trackingUrl) handled by updateTrackingRules + validateRequest.
const updateOrderTracking = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: "Invalid order id" });
    }

    const { provider, trackingId, trackingUrl } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.tracking.provider = provider;
    order.tracking.trackingId = trackingId;

    // Get an initial status from the (placeholder) tracking service
    const result = await fetchTrackingStatus({ provider, trackingId });
    order.tracking.status = result.status;
    order.tracking.trackingUrl = trackingUrl || result.trackingUrl;

    addHistoryEntry(order, order.status, `Tracking info added: ${provider} / ${trackingId}`, req.user._id);

    await order.save();
    notifyOrderStatusChange(order, order.status, order.status); // tracking-only event, status itself unchanged

    res.status(200).json({ success: true, message: "Tracking info updated", data: order });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyOrders,
  adminGetOrders,
  getOrderById,
  updateOrderStatus,
  getOrderTracking,
  updateOrderTracking,
};
