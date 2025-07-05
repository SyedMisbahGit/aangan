// SQLite backup script for cron
import { execSync } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync, mkdirSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get database path from environment or use default
const DATABASE_PATH = process.env.DATABASE_PATH || join(__dirname, "../backend/whispers.db");
const BACKUP_DIR = join(__dirname, "../backups");

// Create backups directory if it doesn't exist
if (!existsSync(BACKUP_DIR)) {
  mkdirSync(BACKUP_DIR, { recursive: true });
}

// Generate backup filename with timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupFile = `whispers-${timestamp}.gz`;
const backupPath = join(BACKUP_DIR, backupFile);

try {
  console.log(`📁 Starting database backup...`);
  console.log(`📊 Source: ${DATABASE_PATH}`);
  console.log(`💾 Destination: ${backupPath}`);
  
  // Compress database file
  execSync(`gzip -c "${DATABASE_PATH}" > "${backupPath}"`);
  
  console.log(`✅ Backup completed successfully: ${backupFile}`);
  console.log(`📈 Backup size: ${(execSync(`stat -c%s "${backupPath}"`).toString().trim() / 1024 / 1024).toFixed(2)} MB`);
  
} catch (error) {
  console.error(`❌ Backup failed: ${error.message}`);
  process.exit(1);
}
