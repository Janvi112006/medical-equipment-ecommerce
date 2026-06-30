const Product = require("../models/Product");

// Maps the `sort` query param to a Mongoose sort object.
// Defaults to "newest" if not provided or unrecognized.
const SORT_OPTIONS = {
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  name_asc: { name: 1 },
  name_desc: { name: -1 },
  newest: { createdAt: -1 },
};

// GET /api/products
// Supports: ?search=&category=&minPrice=&maxPrice=&inStock=&sort=&page=&limit=
const getProducts = async (req, res, next) => {
  try {
    const { search, category, minPrice, maxPrice, inStock, sort } = req.query;
    const filter = {};

    // Search across name AND description (case-insensitive)
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }

    // Stock availability filter
    if (inStock === "true") {
      filter.stock = { $gt: 0 };
    } else if (inStock === "false") {
      filter.stock = { $lte: 0 };
    }

    // Pagination (defaults: page 1, limit 10, capped at 50 per page)
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
    const skip = (page - 1) * limit;

    // Sorting
    const sortOption = SORT_OPTIONS[sort] || SORT_OPTIONS.newest;

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortOption).skip(skip).limit(limit),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/products/categories
// Returns the distinct list of categories currently in use (useful for filter dropdowns)
const getCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct("category");
    res.status(200).json({ success: true, data: categories.sort() });
  } catch (error) {
    next(error);
  }
};

// GET /api/products/:id
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// POST /api/products  (admin only)
// Field validation (name/description/category/price/stock/images) is handled
// by createProductRules + validateRequest middleware before this runs.
const createProduct = async (req, res, next) => {
  try {
    const { name, description, category, price, stock, images } = req.body;

    const product = await Product.create({
      name,
      description,
      category,
      price,
      stock: stock || 0,
      images: images || [],
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, message: "Product created successfully", data: product });
  } catch (error) {
    next(error);
  }
};

// PUT /api/products/:id  (admin only)
// Field validation handled by updateProductRules + validateRequest middleware.
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const fields = ["name", "description", "category", "price", "stock", "images"];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    const updatedProduct = await product.save();
    res.status(200).json({ success: true, message: "Product updated successfully", data: updatedProduct });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/products/:id/stock  (admin only)
// Inventory management, kept separate from the general update route so stock
// changes are explicit and auditable on their own.
// Body: { "stock": 25 }   -> sets stock to an absolute value
// Body: { "adjust": -3 }  -> adds/subtracts from current stock (won't go below 0)
const updateStock = async (req, res, next) => {
  try {
    const { stock, adjust } = req.body;

    if (stock === undefined && adjust === undefined) {
      return res.status(400).json({
        success: false,
        message: "Provide either 'stock' (absolute value) or 'adjust' (delta) in the request body",
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (stock !== undefined) {
      product.stock = stock;
    } else {
      product.stock = Math.max(product.stock + adjust, 0);
    }

    const updatedProduct = await product.save();
    res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      data: { _id: updatedProduct._id, stock: updatedProduct.stock },
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/products/:id  (admin only)
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    await product.deleteOne();
    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getCategories,
  getProductById,
  createProduct,
  updateProduct,
  updateStock,
  deleteProduct,
};
