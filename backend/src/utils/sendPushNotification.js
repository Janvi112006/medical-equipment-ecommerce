let admin = null;

try {
  admin = require("./firebaseAdmin");
} catch (error) {
  console.log("Firebase Admin not configured on this environment.");
}

const sendPushNotification = async ({ token, title, body }) => {
  try {
    if (!admin || !token) return;

    await admin.messaging().send({
      token,
      notification: {
        title,
        body,
      },
    });

    console.log("Push notification sent:", title);
  } catch (error) {
    console.log("Push notification failed:", error.message);
  }
};

module.exports = sendPushNotification;