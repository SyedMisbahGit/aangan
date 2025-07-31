const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const { gzipSizeSync } = require('gzip-size');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
const { WebpackBundleSizeAnalyzerPlugin } = require('webpack-bundle-size-analyzer');
const packageJson = require('../package.json');

// Configuration
const CONFIG = {
  buildDir: path.join(process.cwd(), 'dist'),
  reportDir: path.join(process.cwd(), 'reports', 'bundle-analysis'),
  maxBundleSize: 500 * 1024, // 500KB
  maxInitialLoadSize: 1 * 1024 * 1024, // 1MB
  maxTotalSize: 5 * 1024 * 1024, // 5MB
};

// Ensure directories exist
[CONFIG.buildDir, CONFIG.reportDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Run a shell command and return the output
 */
function runCommand(command) {
  try {
    return execSync(command, { stdio: 'pipe' }).toString().trim();
  } catch (error) {
    console.error(`Error executing command: ${command}`, error);
    return '';
  }
}

/**
 * Get the size of a file
 */
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    console.error(`Error getting size for ${filePath}:`, error);
    return 0;
  }
}

/**
 * Get the gzipped size of a file
 */
function getGzippedSize(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    return gzipSizeSync(buffer);
  } catch (error) {
    console.error(`Error getting gzipped size for ${filePath}:`, error);
    return 0;
  }
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Analyze the production bundle
 */
async function analyzeBundle() {
  console.log('\n🔍 Analyzing production bundle...');
  
  // 1. Build the production bundle with analysis
  console.log('\n🏗️  Building production bundle with analysis...');
  process.env.ANALYZE = 'true';
  runCommand('npm run build');
  
  // 2. Get bundle stats
  const statsPath = path.join(CONFIG.buildDir, 'bundle-stats.json');
  let stats = {};
  
  if (fs.existsSync(statsPath)) {
    stats = JSON.parse(await readFile(statsPath, 'utf8'));
  }
  
  // 3. Analyze main bundle files
  const mainBundlePath = path.join(CONFIG.buildDir, 'static', 'js', 'main.*.js');
  const mainBundleFiles = fs.readdirSync(path.dirname(mainBundlePath));
  const mainBundleFile = mainBundleFiles.find(file => file.startsWith('main.') && file.endsWith('.js'));
  
  if (mainBundleFile) {
    const fullPath = path.join(path.dirname(mainBundlePath), mainBundleFile);
    const size = getFileSize(fullPath);
    const gzippedSize = getGzippedSize(fullPath);
    
    stats.mainBundle = {
      file: mainBundleFile,
      size,
      gzippedSize,
      formattedSize: formatBytes(size),
      formattedGzippedSize: formatBytes(gzippedSize),
      isOverLimit: size > CONFIG.maxBundleSize,
    };
  }
  
  // 4. Analyze asset sizes
  const assetSizes = [];
  const assetDir = path.join(CONFIG.buildDir, 'static');
  
  const walkDir = (dir, fileList = []) => {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        walkDir(filePath, fileList);
      } else {
        const size = stat.size;
        const gzippedSize = getGzippedSize(filePath);
        
        fileList.push({
          file: path.relative(CONFIG.buildDir, filePath),
          size,
          gzippedSize,
          formattedSize: formatBytes(size),
          formattedGzippedSize: formatBytes(gzippedSize),
        });
      }
    });
    
    return fileList;
  };
  
  const assets = walkDir(assetDir);
  stats.assets = assets.sort((a, b) => b.size - a.size);
  
  // 5. Calculate total size
  const totalSize = assets.reduce((sum, asset) => sum + asset.size, 0);
  const totalGzippedSize = assets.reduce((sum, asset) => sum + (asset.gzippedSize || 0), 0);
  
  stats.summary = {
    totalSize,
    totalGzippedSize,
    formattedTotalSize: formatBytes(totalSize),
    formattedTotalGzippedSize: formatBytes(totalGzippedSize),
    isOverLimit: totalSize > CONFIG.maxTotalSize,
    assetCount: assets.length,
  };
  
  // 6. Find duplicate dependencies
  console.log('\n🔎 Checking for duplicate dependencies...');
  try {
    const duplicates = runCommand('npx npm-check-duplicates');
    stats.duplicates = duplicates || 'No duplicates found.';
  } catch (error) {
    stats.duplicates = 'Error checking for duplicates.';
  }
  
  // 7. Find unused dependencies
  console.log('\n🔍 Checking for unused dependencies...');
  try {
    const depcheck = require('depcheck');
    const depcheckOptions = {
      ignorePatterns: ['dist', 'build', 'coverage', '*.test.js', '*.spec.js', '*.stories.js'],
    };
    
    const result = await depcheck(process.cwd(), depcheckOptions);
    stats.unusedDependencies = result.dependencies;
    stats.unusedDevDependencies = result.devDependencies;
    stats.missingDependencies = result.missing;
  } catch (error) {
    console.error('Error running depcheck:', error);
    stats.unusedDependencies = [];
    stats.unusedDevDependencies = [];
    stats.missingDependencies = [];
  }
  
  // 8. Save the analysis report
  const reportPath = path.join(CONFIG.reportDir, `bundle-analysis-${Date.now()}.json`);
  await writeFile(reportPath, JSON.stringify(stats, null, 2));
  
  // 9. Generate a markdown report
  await generateMarkdownReport(stats, path.join(CONFIG.reportDir, 'bundle-report.md'));
  
  console.log('\n✅ Bundle analysis complete!');
  console.log(`📊 Report saved to: ${reportPath}`);
  
  return stats;
}

/**
 * Generate a markdown report from the analysis
 */
async function generateMarkdownReport(stats, outputPath) {
  let markdown = '# 📦 Bundle Analysis Report\n\n';
  
  // Summary
  markdown += '## 📊 Summary\n\n';
  markdown += `- **Total Size**: ${stats.summary.formattedTotalSize} (${stats.summary.formattedTotalGzippedSize} gzipped)\n`;
  markdown += `- **Main Bundle**: ${stats.mainBundle.formattedSize} (${stats.mainBundle.formattedGzippedSize} gzipped)\n`;
  markdown += `- **Asset Count**: ${stats.summary.assetCount}\n`;
  markdown += `- **Over Size Limit**: ${stats.summary.isOverLimit ? '❌ Yes' : '✅ No'}\n\n`;
  
  // Largest Assets
  markdown += '## 📦 Largest Assets\n\n';
  markdown += '| File | Size | Gzipped |\n';
  markdown += '|------|------|---------|\n';
  
  stats.assets.slice(0, 10).forEach(asset => {
    markdown += `| ${asset.file} | ${asset.formattedSize} | ${asset.formattedGzippedSize} |\n`;
  });
  
  markdown += '\n';
  
  // Unused Dependencies
  if (stats.unusedDependencies && stats.unusedDependencies.length > 0) {
    markdown += '## ❌ Unused Dependencies\n\n';
    markdown += 'These dependencies are installed but not used in your code:\n\n';
    stats.unusedDependencies.forEach(dep => {
      markdown += `- ${dep}\n`;
    });
    markdown += '\n';
  }
  
  // Unused Dev Dependencies
  if (stats.unusedDevDependencies && stats.unusedDevDependencies.length > 0) {
    markdown += '## ⚠️ Unused Dev Dependencies\n\n';
    markdown += 'These devDependencies are installed but not used in your code:\n\n';
    stats.unusedDevDependencies.forEach(dep => {
      markdown += `- ${dep}\n`;
    });
    markdown += '\n';
  }
  
  // Missing Dependencies
  if (stats.missingDependencies && Object.keys(stats.missingDependencies).length > 0) {
    markdown += '## ❗ Missing Dependencies\n\n';
    markdown += 'These dependencies are used in your code but not listed in package.json:\n\n';
    Object.entries(stats.missingDependencies).forEach(([dep, files]) => {
      markdown += `- **${dep}** used in:\n`;
      files.slice(0, 5).forEach(file => {
        markdown += `  - ${file}\n`;
      });
      if (files.length > 5) {
        markdown += `  - ... and ${files.length - 5} more\n`;
      }
    });
    markdown += '\n';
  }
  
  // Duplicate Dependencies
  if (stats.duplicates && stats.duplicates !== 'No duplicates found.') {
    markdown += '## 🔄 Duplicate Dependencies\n\n';
    markdown += '```\n';
    markdown += stats.duplicates;
    markdown += '\n```\n\n';
  }
  
  // Recommendations
  markdown += '## 💡 Recommendations\n\n';
  
  if (stats.unusedDependencies && stats.unusedDependencies.length > 0) {
    markdown += '1. **Remove unused dependencies**:\n';
    markdown += '   ```bash\n';
    markdown += `   npm uninstall ${stats.unusedDependencies.join(' ')}\n`;
    markdown += '   ```\n\n';
  }
  
  if (stats.mainBundle.size > CONFIG.maxBundleSize) {
    markdown += '2. **Reduce main bundle size**:\n';
    markdown += '   - Implement code splitting with React.lazy() and Suspense\n';
    markdown += '   - Use dynamic imports for large dependencies\n';
    markdown += '   - Consider using a smaller alternative to large dependencies\n\n';
  }
  
  if (stats.summary.totalSize > CONFIG.maxTotalSize) {
    markdown += '3. **Optimize assets**:\n';
    markdown += '   - Compress images and use modern formats (WebP, AVIF)\n';
    markdown += '   - Enable gzip/Brotli compression on your server\n';
    markdown += '   - Use a CDN for static assets\n\n';
  }
  
  markdown += '4. **Additional optimizations**:\n';
  markdown += '   - Enable tree shaking in your bundler\n';
  markdown += '   - Use code splitting for routes and large components\n';
  markdown += '   - Consider using a smaller UI library or individual components\n\n';
  
  // Save the markdown report
  await writeFile(outputPath, markdown);
  
  return markdown;
}

// Run the analysis
analyzeBundle().then(stats => {
  console.log('\n📊 Bundle Analysis Results:');
  console.log(`- Total Size: ${stats.summary.formattedTotalSize} (${stats.summary.formattedTotalGzippedSize} gzipped)`);
  console.log(`- Main Bundle: ${stats.mainBundle.formattedSize} (${stats.mainBundle.formattedGzippedSize} gzipped)`);
  console.log(`- Asset Count: ${stats.summary.assetCount}`);
  console.log(`- Over Size Limit: ${stats.summary.isOverLimit ? '❌ Yes' : '✅ No'}`);
  
  if (stats.unusedDependencies && stats.unusedDependencies.length > 0) {
    console.log(`\n❌ Unused Dependencies (${stats.unusedDependencies.length}):`);
    console.log(stats.unusedDependencies.join(', '));
  }
  
  if (stats.unusedDevDependencies && stats.unusedDevDependencies.length > 0) {
    console.log(`\n⚠️  Unused Dev Dependencies (${stats.unusedDevDependencies.length}):`);
    console.log(stats.unusedDevDependencies.join(', '));
  }
  
  if (stats.missingDependencies && Object.keys(stats.missingDependencies).length > 0) {
    console.log(`\n❗ Missing Dependencies (${Object.keys(stats.missingDependencies).length}):`);
    console.log(Object.keys(stats.missingDependencies).join(', '));
  }
  
  console.log(`\n📝 Full report generated at: ${path.join(CONFIG.reportDir, 'bundle-report.md')}`);
  
  if (stats.summary.isOverLimit || 
      (stats.unusedDependencies && stats.unusedDependencies.length > 0) ||
      (stats.missingDependencies && Object.keys(stats.missingDependencies).length > 0)) {
    process.exit(1);
  }
}).catch(error => {
  console.error('Error during bundle analysis:', error);
  process.exit(1);
});
