// PLACEHOLDER for Firebase Cloud Messaging push notifications on mobile.
//
// Per the project roadmap, Firebase push notifications are their own
// not-yet-built phase. This file exists so the rest of the app already has
// a stable place to call into — when FCM is wired in later, only the inside
// of these functions needs to change, not every screen that might want to
// register for or react to a notification.
//
// What a real implementation would add here:
//   - expo-notifications (or @react-native-firebase/messaging) dependency
//   - registerForPushNotificationsAsync(): request permission, get an Expo
//     push token / FCM token, and send it to a new backend endpoint
//     (e.g. POST /api/users/push-token) so the backend can target this device
//   - A notification listener wired up in App.js to handle incoming
//     notifications (e.g. "Your order has shipped") and navigate accordingly

export const registerForPushNotificationsAsync = async () => {
  console.log(
    "[push-placeholder] Push notification registration is not implemented yet. " +
      "This is a placeholder for a future Firebase Cloud Messaging integration."
  );
  return null;
};

export const handleIncomingNotification = (notification) => {
  console.log("[push-placeholder] Would handle incoming notification:", notification);
};
