// SQLite backup script for cron
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '../backend/whispers.db');
const backupsDir = path.join(__dirname, '../backups');
if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir);
const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 15);
const dest = path.join(backupsDir, `whispers-${timestamp}.db`);

fs.copyFileSync(src, dest);
console.log(`Backup complete: ${dest}`);
