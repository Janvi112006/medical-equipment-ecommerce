const admin = require("./firebaseAdmin");

const sendPushNotification = async ({ token, title, body }) => {
  try {
    if (!token) return;

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