import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDlgAJh6oGWbjDneyTGPBoFSJezeflCDqE",
  authDomain: "shhh-c0007.firebaseapp.com",
  projectId: "shhh-c0007",
  storageBucket: "shhh-c0007.firebasestorage.app",
  messagingSenderId: "333474855813",
  appId: "1:333474855813:web:8c4c569e3d0e85e41222ec",
  measurementId: "G-PGK05R109T",
};

const app = initializeApp(firebaseConfig);

const messagingPromise = isSupported().then((supported) => {
  if (supported) {
    return getMessaging(app);
  }
  return null;
});

export default messagingPromise;
