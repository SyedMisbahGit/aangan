const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const outputFile = path.join(__dirname, '..', 'DEPENDENCY-REPORT.md');

console.log('Running depcheck...');

(async () => {
  try {
    // Run depcheck and capture output
    const result = execSync('npx depcheck --json', { encoding: 'utf-8' });
    let report;
    try {
      report = JSON.parse(result);
    } catch (e) {
      console.error('Failed to parse depcheck output:', e);
      console.error('Raw output:', result);
      return;
    }
  
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
  
  // Unused devDependencies
  if (report.devDependencies && report.devDependencies.length > 0) {
    markdown += '## Unused Dev Dependencies\n\n';
    markdown += 'These devDependencies are not used in your code:\n\n';
    report.devDependencies.forEach(dep => {
      markdown += `- ${dep}\n`;
    });
    markdown += '\n';
  }
  
  // Missing dependencies
  if (Object.keys(report.missing || {}).length > 0) {
    markdown += '## Missing Dependencies\n\n';
    markdown += 'These packages are used in your code but not listed in package.json:\n\n';
    Object.entries(report.missing).forEach(([pkg, files]) => {
      markdown += `- **${pkg}**\n`;
      if (Array.isArray(files)) {
        files.forEach(file => {
          markdown += `  - ${file}\n`;
        });
      }
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
})();
