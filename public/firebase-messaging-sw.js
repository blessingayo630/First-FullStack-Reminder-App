// importScripts(
//   "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js",
// );
// importScripts(
//   "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js",
// );

// firebase.initializeApp({
//   apiKey: "AIzaSyAbwM4FDKaW2gM2upv2pW6uQAQYoXGyy5Q",
//   authDomain: "reminder-app-5b9d6.firebaseapp.com",
//   projectId: "reminder-app-5b9d6",
//   storageBucket: "reminder-app-5b9d6.firebasestorage.app",
//   messagingSenderId: "377850916913",
//   appId: "1:377850916913:web:0ef215955ee2affc042510",
// });

// const messaging = firebase.messaging();

// messaging.onBackgroundMessage(function (payload) {
//   self.registration.showNotification(payload.notification.title, {
//     body: payload.notification.body,
//     icon: "/icon.png",
//   });
// });

importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js",
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyAbwM4FDKaW2gM2upv2pW6uQAQYoXGyy5Q",
  authDomain: "reminder-app-5b9d6.firebaseapp.com",
  projectId: "reminder-app-5b9d6",
  storageBucket: "reminder-app-5b9d6.firebasestorage.app",
  messagingSenderId: "377850916913",
  appId: "1:377850916913:web:0ef215955ee2affc042510",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Background message received:", payload);

  self.registration.showNotification(
    payload.notification?.title || "Reminder",
    {
      body: payload.notification?.body || "You have a reminder",
      icon: "/icon.png",
    },
  );
});
