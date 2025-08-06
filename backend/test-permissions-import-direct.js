// Test file to verify direct import of permissions.js
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Current directory:', __dirname);
console.log('Attempting to import permissions.js...');

try {
  const modulePath = path.resolve(__dirname, './src/utils/permissions.js');
  console.log('Module path:', modulePath);
  
  // Try dynamic import
  const { getPermissionsForRole } = await import(modulePath);
  console.log('✅ Successfully imported getPermissionsForRole:', typeof getPermissionsForRole);
  
  // Test the function
  const permissions = getPermissionsForRole('admin');
  console.log('Admin permissions:', permissions);
} catch (error) {
  console.error('❌ Error importing permissions.js:');
  console.error(error);
  
  // Additional debug info
  console.log('\nAdditional debug info:');
  try {
    const fs = await import('fs');
    const exists = fs.existsSync(path.resolve(__dirname, './src/utils/permissions.js'));
    console.log('File exists:', exists);
    console.log('File stats:', fs.statSync(path.resolve(__dirname, './src/utils/permissions.js')));
  } catch (fsError) {
    console.error('Error checking file:', fsError);
  }
}
