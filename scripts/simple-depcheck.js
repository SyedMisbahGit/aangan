const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const outputFile = path.join(process.cwd(), 'DEPENDENCY-REPORT.md');

console.log('Running depcheck...');

try {
  // Run depcheck and capture output
  const result = execSync('npx depcheck --json', { encoding: 'utf-8' });
  const report = JSON.parse(result);
  
  // Generate markdown report
  let markdown = '# Dependency Analysis Report\n\n';
  markdown += `Generated on: ${new Date().toISOString()}\n\n`;
  
  // Unused dependencies
  if (report.dependencies && report.dependencies.length > 0) {
    markdown += '## Unused Dependencies\n\n';
    markdown += 'These dependencies are not used in your code:\n\n';
    report.dependencies.forEach(dep => {
      markdown += `- ${dep}\n`;
    });
    markdown += '\n';
  }
  
  // Write the report
  fs.writeFileSync(outputFile, markdown);
  console.log(`✅ Dependency report generated at: ${outputFile}`);
  
} catch (error) {
  console.error('Error generating dependency report:', error.message);
  process.exit(1);
}
