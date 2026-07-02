const { initializeApp, cert, getApps } = require("firebase-admin/app");
const serviceAccount = require("../../firebase-service-account.json");

if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

module.exports = require("firebase-admin");