const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const admin = require('firebase-admin');
const { readFileSync } = require('fs');

// Load Firebase service account
const serviceAccount = require(path.join(__dirname, '../backend/../serviceAccountKey.json.json'));
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

// DB path
const dbPath = path.join(__dirname, '../backend/whispers.db');
const db = new sqlite3.Database(dbPath);

// Date logic
const now = new Date();
const IST_OFFSET = 5.5 * 60 * 60 * 1000;
const nowIST = new Date(now.getTime() + IST_OFFSET);
const expireDate = new Date('2024-07-14T23:59:59+05:30');
if (nowIST > expireDate) {
  console.log('SummerSoul prompt expired. No push sent.');
  process.exit(0);
}

const title = 'SummerSoul Thought';
const body = 'Aaj ka SummerSoul thought — kaisa lag raha hai ghar pe?';

// Get all FCM tokens
function getTokens(cb) {
  db.all('SELECT token FROM fcm_tokens', (err, rows) => {
    if (err) return cb(err);
    cb(null, rows.map(r => r.token));
  });
}

getTokens((err, tokens) => {
  if (err) return console.error('DB error:', err);
  if (!tokens.length) return console.log('No FCM tokens to send to.');
  const message = {
    notification: { title, body },
    tokens,
  };
  admin.messaging().sendMulticast(message)
    .then(resp => {
      console.log('Push sent:', resp.successCount, 'success,', resp.failureCount, 'failures');
    })
    .catch(e => {
      console.error('Push error:', e);
    });
}); 