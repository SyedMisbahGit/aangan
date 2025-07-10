#!/usr/bin/env node

/**
 * Aangan Platform Maintenance Script
 * 
 * This script automates common maintenance tasks to keep the application
 * simple, secure, and sustainable.
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = (message, color = colors.reset) => {
  console.log(`${color}${message}${colors.reset}`);
};

const runCommand = (command, description) => {
  try {
    log(`\n🔧 ${description}...`, colors.blue);
    const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    log(`✅ ${description} completed`, colors.green);
    return result;
  } catch (error) {
    log(`❌ ${description} failed: ${error.message}`, colors.red);
    return null;
  }
};

const checkSecurity = () => {
  log('\n🛡️  Security Check', colors.magenta);
  
  // Check for known vulnerabilities
  const auditResult = runCommand('npm audit --audit-level moderate', 'Security audit');
  if (auditResult && auditResult.includes('found')) {
    log('⚠️  Security vulnerabilities found. Run "npm audit fix" to resolve.', colors.yellow);
  }
  
  // Check for outdated packages
  const outdatedResult = runCommand('npm outdated', 'Check outdated packages');
  if (outdatedResult && outdatedResult.includes('Wanted')) {
    log('⚠️  Outdated packages found. Consider updating for security patches.', colors.yellow);
  }
  
  // Check environment variables
  const envExample = readFileSync('backend/env.example', 'utf8');
  const requiredVars = ['JWT_SECRET', 'ADMIN_PASS_HASH', 'SOCKET_SHARED_KEY'];
  const missingVars = requiredVars.filter(varName => !envExample.includes(varName));
  
  if (missingVars.length > 0) {
    log(`⚠️  Missing environment variables in example: ${missingVars.join(', ')}`, colors.yellow);
  }
};

const checkPerformance = () => {
  log('\n⚡ Performance Check', colors.cyan);
  
  // Check bundle size
  const buildResult = runCommand('npm run build', 'Build application');
  if (buildResult) {
    log('✅ Build completed successfully', colors.green);
    
    // Analyze bundle size (if bundle-analyzer is available)
    try {
      const bundleInfo = execSync('npx vite-bundle-analyzer dist --mode static', { encoding: 'utf8' });
      log('📊 Bundle analysis completed', colors.green);
    } catch (error) {
      log('ℹ️  Install vite-bundle-analyzer for detailed bundle analysis', colors.blue);
    }
  }
  
  // Check for large dependencies
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
  const largeDeps = Object.entries(packageJson.dependencies)
    .filter(([name, version]) => {
      // Check for known large packages
      const largePackages = ['@capacitor', 'firebase-admin', 'sqlite3'];
      return largePackages.some(largePkg => name.includes(largePkg));
    });
  
  if (largeDeps.length > 0) {
    log(`⚠️  Large dependencies detected: ${largeDeps.map(([name]) => name).join(', ')}`, colors.yellow);
  }
};

const checkCodeQuality = () => {
  log('\n📝 Code Quality Check', colors.blue);
  
  // Run linting
  const lintResult = runCommand('npm run lint', 'ESLint check');
  if (lintResult && lintResult.includes('error')) {
    log('⚠️  Linting errors found. Fix them for better code quality.', colors.yellow);
  }
  
  // Run tests
  const testResult = runCommand('npm test', 'Unit tests');
  if (testResult && testResult.includes('FAIL')) {
    log('⚠️  Tests failed. Fix them to maintain code quality.', colors.yellow);
  }
  
  // Check TypeScript
  const tsResult = runCommand('npx tsc --noEmit', 'TypeScript check');
  if (tsResult && tsResult.includes('error')) {
    log('⚠️  TypeScript errors found. Fix them for type safety.', colors.yellow);
  }
};

const cleanup = () => {
  log('\n🧹 Cleanup Tasks', colors.green);
  
  // Clean build artifacts (cross-platform)
  const isWindows = process.platform === 'win32';
  const cleanCommand = isWindows 
    ? 'if exist dist rmdir /s /q dist && if exist dev-dist rmdir /s /q dev-dist && if exist coverage rmdir /s /q coverage && if exist .vite rmdir /s /q .vite'
    : 'rm -rf dist dev-dist coverage .vite';
  runCommand(cleanCommand, 'Clean build artifacts');
  
  // Clean node_modules (optional)
  const args = process.argv.slice(2);
  if (args.includes('--deep')) {
    const deepCleanCommand = isWindows 
      ? 'if exist node_modules rmdir /s /q node_modules && if exist backend\\node_modules rmdir /s /q backend\\node_modules'
      : 'rm -rf node_modules backend/node_modules';
    runCommand(deepCleanCommand, 'Clean node_modules');
    runCommand('npm install', 'Reinstall dependencies');
  }
  
  // Clean cache
  runCommand('npm cache clean --force', 'Clean npm cache');
};

const updateDependencies = () => {
  log('\n🔄 Dependency Updates', colors.yellow);
  
  // Check for updates
  const outdatedResult = runCommand('npm outdated', 'Check for outdated packages');
  
  if (outdatedResult && !outdatedResult.includes('Wanted')) {
    log('✅ All packages are up to date', colors.green);
    return;
  }
  
  // Update minor and patch versions
  runCommand('npm update', 'Update packages');
  
  // Check for major version updates
  log('ℹ️  Check for major version updates manually with "npm outdated"', colors.blue);
};

const generateReport = () => {
  log('\n📊 Generating Maintenance Report', colors.magenta);
  
  const report = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    npmVersion: execSync('npm --version', { encoding: 'utf8' }).trim(),
    packageCount: Object.keys(JSON.parse(readFileSync('package.json', 'utf8')).dependencies).length,
    lastMaintenance: new Date().toISOString()
  };
  
  writeFileSync('maintenance-report.json', JSON.stringify(report, null, 2));
  log('✅ Maintenance report generated: maintenance-report.json', colors.green);
};

const showHelp = () => {
  log(`
🔧 Aangan Platform Maintenance Script

Usage: node scripts/maintenance.js [options]

Options:
  --security     Run security checks
  --performance  Run performance checks
  --quality      Run code quality checks
  --cleanup      Clean build artifacts and cache
  --update       Update dependencies
  --deep         Deep cleanup (includes node_modules)
  --all          Run all checks (default)
  --help         Show this help

Examples:
  node scripts/maintenance.js --security
  node scripts/maintenance.js --cleanup --deep
  node scripts/maintenance.js --all
`, colors.cyan);
};

const main = () => {
  const args = process.argv.slice(2);
  
  if (args.includes('--help')) {
    showHelp();
    return;
  }
  
  log('🌸 Aangan Platform Maintenance', colors.bright + colors.magenta);
  log('Keeping it simple, secure, and sustainable...\n', colors.blue);
  
  if (args.length === 0 || args.includes('--all')) {
    checkSecurity();
    checkPerformance();
    checkCodeQuality();
    cleanup();
    updateDependencies();
  } else {
    if (args.includes('--security')) checkSecurity();
    if (args.includes('--performance')) checkPerformance();
    if (args.includes('--quality')) checkCodeQuality();
    if (args.includes('--cleanup')) cleanup();
    if (args.includes('--update')) updateDependencies();
  }
  
  generateReport();
  
  log('\n✨ Maintenance complete!', colors.bright + colors.green);
  log('Check maintenance-report.json for details.', colors.blue);
};

main(); 