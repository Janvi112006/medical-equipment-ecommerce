const { initializeApp, cert, getApps } = require("firebase-admin/app");
const admin = require("firebase-admin");

if (
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY
) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  };

  if (getApps().length === 0) {
    initializeApp({
      credential: cert(serviceAccount),
    });
  }
}

module.exports = admin;