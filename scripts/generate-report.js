const fs = require('fs');
const path = require('path');

// Read the JSON report
const reportPath = path.join(__dirname, '..', 'dependency-report.json');
const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

// Generate markdown content
let markdown = '# Dependency Analysis Report\n\n';
markdown += `Generated on: ${new Date().toISOString()}\n\n`;

// Unused dependencies
if (report.dependencies && report.dependencies.length > 0) {
  markdown += '## Unused Dependencies\n\n';
  markdown += 'These dependencies are not used in your code but are listed in package.json:\n\n';
  report.dependencies.forEach(dep => {
    markdown += `- ${dep}\n`;
  });
  markdown += '\n';
}

// Missing dependencies
if (report.missing && Object.keys(report.missing).length > 0) {
  markdown += '## Missing Dependencies\n\n';
  markdown += 'These packages are used in your code but not listed in package.json:\n\n';
  Object.entries(report.missing).forEach(([pkg, files]) => {
    markdown += `- **${pkg}**\n`;
    if (Array.isArray(files)) {
      files.slice(0, 5).forEach(file => {
        markdown += `  - ${file}\n`;
      });
      if (files.length > 5) {
        markdown += `  - ...and ${files.length - 5} more\n`;
      }
    }
  });
  markdown += '\n';
}

// Write the markdown report
const outputPath = path.join(__dirname, '..', 'DEPENDENCY-REPORT.md');
fs.writeFileSync(outputPath, markdown);
console.log(`✅ Markdown report generated at: ${outputPath}`);
