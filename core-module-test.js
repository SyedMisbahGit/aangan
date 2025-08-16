// Test file to check core module imports
console.log('Core module test started');

// Import a core Node.js module
import { readFile } from 'fs/promises';
console.log('Successfully imported fs/promises');

// Try to use the imported module
const files = await readFile(__filename, 'utf8');
console.log('Successfully read current file');

console.log('Core module test completed successfully');
