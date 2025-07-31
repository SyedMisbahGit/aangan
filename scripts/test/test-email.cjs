const nodemailer = require('nodemailer');
const [,, subject, text, to] = process.argv;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 465,
  secure: process.env.SMTP_SECURE === 'true' || true,
  auth: {
    user: process.env.SMTP_USER || 'nocodeai007@gmail.com',
    pass: process.env.SMTP_PASS || 'Wayofindia007',
  },
  connectionTimeout: 10000,
});

transporter.sendMail({
  from: process.env.SMTP_USER || 'nocodeai007@gmail.com',
  to,
  subject,
  text,
}, (err, info) => {
  if (err) {
    console.error('Email error:', err);
    process.exit(1);
  }
  console.log('Test email sent:', info.response);
}); 