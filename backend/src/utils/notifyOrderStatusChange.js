// PLACEHOLDER for push notifications.
// Firebase Cloud Messaging is a separate, not-yet-built phase (per the
// Phase 1 roadmap). This function exists so every place that changes order
// status already calls it now — when FCM is wired in later, only the
// inside of this function needs to change, not every call site.
const notifyOrderStatusChange = (order, previousStatus, newStatus) => {
  console.log(
    `[notify-placeholder] Order ${order._id}: status changed from "${previousStatus}" to "${newStatus}". ` +
      `Would send a push notification to user ${order.user} here once Firebase Cloud Messaging is integrated.`
  );
};

module.exports = notifyOrderStatusChange;
