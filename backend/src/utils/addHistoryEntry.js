// Appends one timeline entry to an order's history.
// Call this BEFORE order.save(), then save once — keeps history changes
// atomic with whatever status/tracking change triggered them.
// changedBy: pass req.user._id for an admin-driven change, or omit/null for
// a system-generated change (e.g. automatic payment confirmation).
const addHistoryEntry = (order, status, note = "", changedBy = null) => {
  order.history.push({ status, note, changedBy, changedAt: new Date() });
};

module.exports = addHistoryEntry;
