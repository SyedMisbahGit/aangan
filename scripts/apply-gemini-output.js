// scripts/apply-gemini-output.js
// Usage: node scripts/apply-gemini-output.js [outputFile]
// Default outputFile: gemini-output.md

const fs = require('fs');
const path = require('path');

const outputFile = process.argv[2] || 'gemini-output.md';
const content = fs.readFileSync(outputFile, 'utf8');

// Regex to match code blocks with file paths in the heading or as comments
const codeBlockRegex = /\*\*`([^`]+)`\*\*\n```([\w.]+)\n([\s\S]*?)```/g;

let match;
let applied = [];

while ((match = codeBlockRegex.exec(content)) !== null) {
  const filePath = match[1].trim();
  const lang = match[2].trim();
  const code = match[3];
  const absPath = path.resolve(process.cwd(), filePath);
  // Ensure directory exists
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  fs.writeFileSync(absPath, code, 'utf8');
  applied.push(filePath);
  console.log(`Applied code to: ${filePath}`);
}

if (applied.length === 0) {
  console.log('No code blocks with file paths found in', outputFile);
} else {
  console.log('All code blocks applied.');
} 