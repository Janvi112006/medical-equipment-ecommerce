const { body } = require("express-validator");

// Rules for POST /api/checkout
// The checkout body must contain EITHER addressId OR shippingAddress.
// Format of each is checked here; the "at least one must be present" rule
// and the sub-field check for an inline shippingAddress are handled in the
// controller, since express-validator's conditional/nested validation for
// this kind of either/or shape would add more complexity than it saves.
const checkoutRules = [
  body("addressId").optional().isMongoId().withMessage("addressId must be a valid id"),

  body("shippingAddress").optional().isObject().withMessage("shippingAddress must be an object"),
];

module.exports = { checkoutRules };
