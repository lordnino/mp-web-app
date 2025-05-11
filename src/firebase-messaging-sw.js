importScripts(
    "https://www.gstatic.com/firebasejs/11.0.1/firebase-app-compat.js"
);
importScripts(
    "https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging-compat.js"
);
firebase.initializeApp({
    apiKey: 'AIzaSyDFccax9vmPVYnUS6ZCq4t0WMGInDGS2222Qeg',
    authDomain: 'sample-71922a2.firebaseapp.com',
    projectId: 'sample-719a2',
    messagingSenderId: '11996592237300',
    appId: '1:119965937300:web:b4e3e2650b96504d4310e81',
});
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});