const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Tax is a placeholder until real tax rules are confirmed (see .env.example TAX_RATE).
// Defaults to 0 if not set, so totals are accurate even before a rate is decided.
const getTaxRate = () => {
  const rate = parseFloat(process.env.TAX_RATE);
  return Number.isFinite(rate) ? rate : 0;
};

// Finds the user's cart, creating an empty one if it doesn't exist yet.
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

// Builds the response shape: populated items + subtotal/tax/total.
// Silently drops any cart line whose product was deleted, and reports how
// many were removed so the client can inform the user.
const buildCartResponse = async (cart) => {
  await cart.populate("items.product");

  const validItems = [];
  let removedCount = 0;

  for (const item of cart.items) {
    if (!item.product) {
      removedCount += 1;
      continue;
    }
    validItems.push(item);
  }

  // If any items referenced deleted products, clean them out of the cart in the DB too
  if (removedCount > 0) {
    cart.items = validItems.map((item) => ({ product: item.product._id, quantity: item.quantity }));
    await cart.save();
  }

  const subtotal = validItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const taxRate = getTaxRate();
  const tax = Math.round(subtotal * taxRate * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  return {
    items: validItems.map((item) => ({
      product: item.product,
      quantity: item.quantity,
      lineTotal: Math.round(item.product.price * item.quantity * 100) / 100,
    })),
    subtotal: Math.round(subtotal * 100) / 100,
    taxRate,
    tax,
    total,
    itemsRemoved: removedCount, // products that no longer exist, auto-removed from cart
  };
};

// GET /api/cart
const getCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    const response = await buildCartResponse(cart);
    res.status(200).json({ success: true, data: response });
  } catch (error) {
    next(error);
  }
};

// POST /api/cart/add
// Body validation (productId, quantity) handled by addToCartRules + validateRequest.
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const cart = await getOrCreateCart(req.user._id);
    const existingItem = cart.items.find((item) => item.product.toString() === productId);
    const newQuantity = existingItem ? existingItem.quantity + quantity : quantity;

    if (newQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} unit(s) of "${product.name}" available in stock`,
      });
    }

    if (existingItem) {
      existingItem.quantity = newQuantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    const response = await buildCartResponse(cart);
    res.status(200).json({ success: true, message: "Item added to cart", data: response });
  } catch (error) {
    next(error);
  }
};

// PUT /api/cart/update
// Body validation (productId, quantity) handled by updateCartRules + validateRequest.
const updateCartItem = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} unit(s) of "${product.name}" available in stock`,
      });
    }

    const cart = await getOrCreateCart(req.user._id);
    const item = cart.items.find((i) => i.product.toString() === productId);

    if (!item) {
      return res.status(404).json({ success: false, message: "This product is not in your cart" });
    }

    item.quantity = quantity;
    await cart.save();

    const response = await buildCartResponse(cart);
    res.status(200).json({ success: true, message: "Cart updated", data: response });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cart/remove/:productId
const removeCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product id" });
    }

    const cart = await getOrCreateCart(req.user._id);
    const itemExists = cart.items.some((item) => item.product.toString() === productId);

    if (!itemExists) {
      return res.status(404).json({ success: false, message: "This product is not in your cart" });
    }

    cart.items = cart.items.filter((item) => item.product.toString() !== productId);
    await cart.save();

    const response = await buildCartResponse(cart);
    res.status(200).json({ success: true, message: "Item removed from cart", data: response });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, getTaxRate };
