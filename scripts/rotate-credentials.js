#!/usr/bin/env node
/**
 * Credential Rotation Script
 * 
 * This script helps rotate exposed credentials in the codebase.
 * Follow these steps:
 * 1. Run this script to identify exposed credentials
 * 2. Rotate the credentials in their respective services
 * 3. Update the .env file with new credentials
 * 4. Verify all services work with the new credentials
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import crypto from 'crypto';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const ENV_FILE = path.join(__dirname, '..', '.env');
const ENV_EXAMPLE = path.join(__dirname, '..', '.env.example');
const BACKUP_DIR = path.join(__dirname, '..', 'backups');

// Create backup directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Create a backup of the current .env file
const backupFile = path.join(BACKUP_DIR, `.env.backup.${Date.now()}`);
fs.copyFileSync(ENV_FILE, backupFile);
console.log(`✅ Created backup at: ${backupFile}`);

// Read current .env file
let envContent = '';
if (fs.existsSync(ENV_FILE)) {
  envContent = fs.readFileSync(ENV_FILE, 'utf8');
}

// Find all sensitive keys from .env.example
const exampleContent = fs.readFileSync(ENV_EXAMPLE, 'utf8');
const sensitiveKeys = [];
const keyValueRegex = /^(\w+)=/gm;
let match;

while ((match = keyValueRegex.exec(exampleContent)) !== null) {
  const key = match[1];
  if (key && !sensitiveKeys.includes(key)) {
    sensitiveKeys.push(key);
  }
}

console.log('\n🔍 Found the following sensitive keys in .env:');
console.log('----------------------------------------');

// Check which sensitive keys are exposed
const exposedKeys = [];
const envLines = envContent.split('\n');

envLines.forEach((line, index) => {
  const trimmedLine = line.trim();
  if (!trimmedLine || trimmedLine.startsWith('#')) return;

  const [key, ...valueParts] = trimmedLine.split('=');
  const value = valueParts.join('=').replace(/^['"](.*)['"]$/, '$1');
  
  if (sensitiveKeys.includes(key)) {
    console.log(`⚠️  [Line ${index + 1}] ${key}=${value.substring(0, 10)}${value.length > 10 ? '...' : ''}`);
    exposedKeys.push(key);
  }
});

if (exposedKeys.length === 0) {
  console.log('✅ No exposed credentials found in .env');
  process.exit(0);
}

console.log('\n🚨 WARNING: The above credentials should be rotated immediately!');
console.log('\nNext steps:');
console.log('1. Rotate each of the above credentials in their respective services');
console.log('2. Update the .env file with the new credentials');
console.log('3. Test that all services work with the new credentials');
console.log('4. Remove the backup file once you\'ve confirmed everything works');
console.log(`\nBackup location: ${backupFile}`);

// Generate a secure random string for credential rotation
const generateSecureString = (length = 32) => {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
};

// Ask if user wants to generate secure replacements
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('\nWould you like to generate secure replacements for these keys? (y/N) ', (answer) => {
  if (answer.toLowerCase() === 'y') {
    console.log('\n🔒 Generated secure replacements:');
    console.log('----------------------------------------');
    
    exposedKeys.forEach(key => {
      const secureValue = generateSecureString(32);
      console.log(`${key}=${secureValue}`);
    });
    
    console.log('\n⚠️  IMPORTANT: Copy these values to a secure location.');
    console.log('Update both your .env file and the corresponding services.');
  }
  
  rl.close();
});
