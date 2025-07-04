const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const nodemailer = require('nodemailer');

// DB path
const dbPath = path.join(__dirname, '../backend/whispers.db');
const db = new sqlite3.Database(dbPath);

// Email config (set these as env vars in production)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER || 'your.email@gmail.com',
    pass: process.env.SMTP_PASS || 'your-app-password',
  },
});
const to = 'nocodeai007@gmail.com';

function getStats(cb) {
  db.serialize(() => {
    db.get('SELECT COUNT(*) as total FROM whispers', (err, totalRow) => {
      if (err) return cb(err);
      db.get('SELECT emotion, COUNT(*) as count FROM whispers GROUP BY emotion ORDER BY count DESC LIMIT 1', (err, topRow) => {
        if (err) return cb(err);
        db.get("SELECT COUNT(DISTINCT zone) as activeSummerSoul FROM whispers WHERE zone LIKE '%summer%';", (err, summerRow) => {
          if (err) return cb(err);
          cb(null, {
            total: totalRow.total,
            topEmotion: topRow ? topRow.emotion : 'N/A',
            activeSummerSoul: summerRow ? summerRow.activeSummerSoul : 0,
          });
        });
      });
    });
  });
}

getStats((err, stats) => {
  if (err) return console.error('DB error:', err);
  const subject = 'Aangan Nightly Analytics Summary';
  const text = `Total whispers: ${stats.total}\nTop emotion: ${stats.topEmotion}\nActive SummerSoul users: ${stats.activeSummerSoul}`;
  transporter.sendMail({ from: process.env.SMTP_USER, to, subject, text }, (err, info) => {
    if (err) return console.error('Email error:', err);
    console.log('Summary sent:', info.response);
  });
}); 