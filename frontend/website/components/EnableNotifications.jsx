"use client";

import { getToken } from "firebase/messaging";
import { getFirebaseMessaging } from "../lib/firebase";

export default function EnableNotifications() {
  async function enableNotifications() {
    try {
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        alert("Notification permission denied");
        return;
      }

      const messaging = await getFirebaseMessaging();

      if (!messaging) {
        alert("Notifications are not supported in this browser");
        return;
      }

      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });

      console.log("Firebase token:", token);
await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/save-fcm-token`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("customer_token")}`,
  },
  body: JSON.stringify({ fcmToken: token }),
});
      alert("Notifications enabled successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to enable notifications");
    }
  }

  return (
    <button className="btn btn-primary" onClick={enableNotifications}>
      Enable Notifications
    </button>
  );
}