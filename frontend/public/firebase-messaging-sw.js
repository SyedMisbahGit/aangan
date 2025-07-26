// Script version: 1.0.0

// Import and configure Firebase
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
const firebaseConfig = {
  apiKey: "AIzaSyDlgAJh6oGWbjDneyTGPBoFSJezeflCDqE",
  authDomain: "shhh-c0007.firebaseapp.com",
  projectId: "shhh-c0007",
  storageBucket: "shhh-c0007.firebasestorage.app",
  messagingSenderId: "333474855813",
  appId: "1:333474855813:web:8c4c569e3d0e85e41222ec",
  measurementId: "G-PGK05R109T"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message: ', payload);
  
  // Customize notification here
  const notificationTitle = payload.notification?.title || 'New notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new message',
    icon: '/favicon.ico', // or any other default icon
    badge: '/badge.png', // optional, for mobile
    data: payload.data || {}
  };

  // Show the notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  // Close the notification popup
  event.notification.close();
  
  // Handle the click action
  if (event.notification.data && event.notification.data.url) {
    // Open the URL if provided in the notification data
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});
