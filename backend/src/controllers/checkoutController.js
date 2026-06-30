const Cart = require("../models/Cart");
const Address = require("../models/Address");
const Order = require("../models/Order");
const { getTaxRate } = require("./cartController");

const REQUIRED_ADDRESS_FIELDS = ["fullName", "phone", "addressLine", "city", "state", "pincode"];

// Resolves the shipping address for this checkout, from either:
//   - body.addressId  -> a previously saved Address owned by this user, or
//   - body.shippingAddress -> an inline address object
// Returns { error } if neither is usable, otherwise { address }.
const resolveShippingAddress = async (req) => {
  const { addressId, shippingAddress } = req.body;

  if (addressId) {
    const saved = await Address.findOne({ _id: addressId, user: req.user._id });
    if (!saved) {
      return { error: "addressId does not match any saved address for this account" };
    }
    return {
      address: {
        fullName: saved.fullName,
        phone: saved.phone,
        addressLine: saved.addressLine,
        city: saved.city,
        state: saved.state,
        pincode: saved.pincode,
      },
    };
  }

  if (shippingAddress) {
    const missing = REQUIRED_ADDRESS_FIELDS.filter((field) => !shippingAddress[field]);
    if (missing.length > 0) {
      return { error: `shippingAddress is missing required field(s): ${missing.join(", ")}` };
    }
    return {
      address: {
        fullName: shippingAddress.fullName,
        phone: shippingAddress.phone,
        addressLine: shippingAddress.addressLine,
        city: shippingAddress.city,
        state: shippingAddress.state,
        pincode: shippingAddress.pincode,
      },
    };
  }

  return { error: "Provide either 'addressId' (a saved address) or 'shippingAddress' (inline address object)" };
};

// POST /api/checkout
// Body format validation (addressId/shippingAddress shape) handled by
// checkoutRules + validateRequest. The "must have one or the other" rule and
// stock validation happen here.
const checkout = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Your cart is empty" });
    }

    // Resolve and validate the delivery address
    const { address, error: addressError } = await resolveShippingAddress(req);
    if (addressError) {
      return res.status(400).json({ success: false, message: addressError });
    }

    // Validate stock for every item BEFORE creating the order or touching inventory
    const stockIssues = [];
    for (const item of cart.items) {
      if (!item.product) {
        stockIssues.push("One of the items in your cart no longer exists and was removed. Please review your cart.");
        continue;
      }
      if (item.product.stock < item.quantity) {
        stockIssues.push(
          `"${item.product.name}" only has ${item.product.stock} unit(s) left, but ${item.quantity} were requested`
        );
      }
    }

    if (stockIssues.length > 0) {
      // Clean up any items referencing deleted products so the cart is consistent
      cart.items = cart.items.filter((item) => item.product);
      await cart.save();
      return res.status(400).json({ success: false, message: "Stock validation failed", errors: stockIssues });
    }

    // Build order item snapshots and totals using CURRENT product price/name
    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
    }));

    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const taxRate = getTaxRate();
    const tax = Math.round(subtotal * taxRate * 100) / 100;
    const totalAmount = Math.round((subtotal + tax) * 100) / 100;

    // Decrement stock for each product.
    // NOTE: done sequentially without a DB transaction — see Known Issues in
    // docs/Phase-05_Cart_Checkout.md for why, and what a hardened version would do.
    for (const item of cart.items) {
      item.product.stock -= item.quantity;
      await item.product.save();
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      subtotal: Math.round(subtotal * 100) / 100,
      tax,
      totalAmount,
      shippingAddress: address,
      status: "pending", // payment pending — Payment Integration phase will update this
      history: [{ status: "pending", note: "Order placed, awaiting payment", changedBy: null, changedAt: new Date() }],
    });

    // Clear the cart now that the order has been placed
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      message: "Order created successfully. Payment is pending.",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { checkout };
