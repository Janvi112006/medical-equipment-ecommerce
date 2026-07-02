importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBLeZhbjCgsUHaLk6-sZRzgzmeKq3D2DTQ",
  authDomain: "medequip-60ca1.firebaseapp.com",
  projectId: "medequip-60ca1",
  storageBucket: "medequip-60ca1.firebasestorage.app",
  messagingSenderId: "43588994770",
  appId: "1:43588994770:web:524cfcfdbe6bf8412ecf0b",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "MedEquip";
  const options = {
    body: payload.notification?.body || "",
    icon: "/favicon.ico",
  };

  self.registration.showNotification(title, options);
});