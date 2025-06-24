const admin = require("firebase-admin");

// Path to your service account key JSON file
const serviceAccount = require("./serviceAccountKey.json");

// Initialize the Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Your FCM registration token (replace with your actual token)
const registrationToken =
  "cEMS87LAWgfTsAxaB_5Gvp:APA91bF_HGhVKJ0ZIjZjvmGmij3MJE2p2hq24YU8cOI1fy1g6MHAiMV-oeMeWoyvbxrSsCJX47HxOtAuuwyOaRN7RgTjscEpm3FbUZzyGF7GKlbZyocHbgU";

const message = {
  notification: {
    title: "Test Notification",
    body: "This is a test push from Node.js!",
  },
  token: registrationToken,
};

admin
  .messaging()
  .send(message)
  .then((response) => {
    console.log("Successfully sent message:", response);
  })
  .catch((error) => {
    console.error("Error sending message:", error);
  }); 