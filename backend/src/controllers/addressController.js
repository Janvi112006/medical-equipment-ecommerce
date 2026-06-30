const mongoose = require("mongoose");
const Address = require("../models/Address");

// POST /api/addresses
// Field validation handled by createAddressRules + validateRequest.
const createAddress = async (req, res, next) => {
  try {
    const { fullName, phone, addressLine, city, state, pincode, country, isDefault } = req.body;

    const address = await Address.create({
      user: req.user._id,
      fullName,
      phone,
      addressLine,
      city,
      state,
      pincode,
      country,
      isDefault: !!isDefault,
    });

    res.status(201).json({ success: true, message: "Address added", data: address });
  } catch (error) {
    next(error);
  }
};

// GET /api/addresses — only the logged-in user's own addresses
const getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: addresses });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/addresses/:id — only if it belongs to the logged-in user
const deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid address id" });
    }

    const address = await Address.findOne({ _id: id, user: req.user._id });
    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    await address.deleteOne();
    res.status(200).json({ success: true, message: "Address deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { createAddress, getAddresses, deleteAddress };
