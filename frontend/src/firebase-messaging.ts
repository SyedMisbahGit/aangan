import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported, MessagePayload } from "firebase/messaging";
import { logger } from "./utils/logger";

export const firebaseConfig = {
  apiKey: "AIzaSyDlgAJh6oGWbjDneyTGPBoFSJezeflCDqE",
  authDomain: "shhh-c0007.firebaseapp.com",
  projectId: "shhh-c0007",
  storageBucket: "shhh-c0007.firebasestorage.app",
  messagingSenderId: "333474855813",
  appId: "1:333474855813:web:8c4c569e3d0e85e41222ec",
  measurementId: "G-PGK05R109T",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// VAPID key for push notifications (replace with your actual VAPID key)
const vapidKey = "YOUR_VAPID_KEY_HERE";

const messagingPromise = isSupported().then((supported) => {
  if (!supported) {
    logger.warn('This browser does not support Firebase Messaging');
    return null;
  }
  
  const messaging = getMessaging(app);
  
  // Request notification permission and get token
  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // First register the service worker
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        
        // Then get the token using the registration
        const token = await getToken(messaging, { 
          vapidKey,
          serviceWorkerRegistration: registration
        });
        logger.info('FCM Token obtained', { token });
        return token;
      } else {
        logger.warn('Notification permission denied');
        return null;
      }
    } catch (error) {
      logger.error('Error getting FCM token', { error });
      return null;
    }
  };

  // Handle incoming messages
  const onMessageListener = (callback: (payload: MessagePayload) => void) => {
    return onMessage(messaging, callback);
  };

  return {
    messaging,
    requestNotificationPermission,
    onMessage: onMessageListener
  };
});

export default messagingPromise;
