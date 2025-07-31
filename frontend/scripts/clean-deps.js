const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const packageJson = require('../package.json');

// Configuration
const CONFIG = {
  dryRun: process.argv.includes('--dry-run'),
  force: process.argv.includes('--force'),
  silent: process.argv.includes('--silent'),
  ignorePatterns: [
    'dist',
    'build',
    'coverage',
    'node_modules',
    '*.test.js',
    '*.spec.js',
    '*.stories.js',
    '*.test.ts',
    '*.spec.ts',
    '*.stories.tsx',
    '*.md',
    '*.json',
    '*.config.js',
  ],
  alwaysIgnore: [
    'react',
    'react-dom',
    'react-scripts',
    '@testing-library',
    'web-vitals',
    'eslint',
    'prettier',
  ],
};

// Log function that respects silent mode
function log(...args) {
  if (!CONFIG.silent) {
    console.log(...args);
  }
}

/**
 * Find unused dependencies using depcheck
 */
async function findUnusedDependencies() {
  log('\n🔍 Analyzing project for unused dependencies...');
  
  try {
    const depcheck = require('depcheck');
    
    const options = {
      ignorePatterns: CONFIG.ignorePatterns,
      skipMissing: false,
    };
    
    const result = await depcheck(process.cwd(), options);
    
    // Filter out dependencies that should always be ignored
    const unusedDeps = result.dependencies.filter(
      dep => !CONFIG.alwaysIgnore.some(ignore => dep.startsWith(ignore))
    );
    
    const unusedDevDeps = result.devDependencies.filter(
      dep => !CONFIG.alwaysIgnore.some(ignore => dep.startsWith(ignore))
    );
    
    const missingDeps = Object.keys(result.missing);
    
    return {
      unusedDependencies: unusedDeps,
      unusedDevDependencies: unusedDevDeps,
      missingDependencies: missingDeps,
      usingDependencies: result.using,
    };
  } catch (error) {
    console.error('Error running depcheck:', error);
    return {
      unusedDependencies: [],
      unusedDevDependencies: [],
      missingDependencies: [],
      usingDependencies: {},
    };
  }
}

/**
 * Remove unused dependencies
 */
async function removeUnusedDependencies(dependencies, isDev = false) {
  if (dependencies.length === 0) {
    log(`\n✅ No unused ${isDev ? 'dev ' : ''}dependencies to remove.`);
    return [];
  }
  
  log(`\n🔧 Found ${dependencies.length} unused ${isDev ? 'dev ' : ''}dependencies:`);
  dependencies.forEach(dep => log(`- ${dep}`));
  
  const removedDeps = [];
  
  if (CONFIG.dryRun) {
    log('\n🚧 Dry run: No changes will be made.');
    return dependencies;
  }
  
  if (!CONFIG.force) {
    log('\n💡 Run with --force to remove these dependencies.');
    return [];
  }
  
  // Remove dependencies one by one with error handling
  for (const dep of dependencies) {
    try {
      log(`\n🗑️  Removing ${dep}...`);
      
      // Remove using npm
      const command = `npm uninstall ${isDev ? '--save-dev' : '--save'} ${dep}`;
      execSync(command, { stdio: 'inherit' });
      
      removedDeps.push(dep);
      log(`✅ Successfully removed ${dep}`);
    } catch (error) {
      console.error(`❌ Error removing ${dep}:`, error.message);
    }
  }
  
  return removedDeps;
}

/**
 * Install missing dependencies
 */
async function installMissingDependencies(dependencies) {
  if (dependencies.length === 0) {
    log('\n✅ No missing dependencies to install.');
    return [];
  }
  
  log(`\n🔧 Found ${dependencies.length} missing dependencies:`);
  dependencies.forEach(dep => log(`- ${dep}`));
  
  const installedDeps = [];
  
  if (CONFIG.dryRun) {
    log('\n🚧 Dry run: No changes will be made.');
    return dependencies;
  }
  
  if (!CONFIG.force) {
    log('\n💡 Run with --force to install these dependencies.');
    return [];
  }
  
  // Install missing dependencies
  try {
    log('\n📦 Installing missing dependencies...');
    const command = `npm install --save ${dependencies.join(' ')}`;
    execSync(command, { stdio: 'inherit' });
    
    installedDeps.push(...dependencies);
    log('✅ Successfully installed missing dependencies');
  } catch (error) {
    console.error('❌ Error installing missing dependencies:', error.message);
  }
  
  return installedDeps;
}

/**
 * Update package.json with the latest versions of dependencies
 */
async function updateDependencies() {
  log('\n🔄 Checking for outdated dependencies...');
  
  try {
    // Get outdated packages
    const outdatedOutput = execSync('npm outdated --json', { encoding: 'utf8' });
    const outdated = JSON.parse(outdatedOutput);
    
    if (Object.keys(outdated).length === 0) {
      log('✅ All dependencies are up to date.');
      return [];
    }
    
    log(`\n🔧 Found ${Object.keys(outdated).length} outdated dependencies:`);
    
    const updates = [];
    
    for (const [pkg, data] of Object.entries(outdated)) {
      const { current, wanted, latest, location, dependent } = data;
      
      // Skip packages that are already at the latest version
      if (current === latest) continue;
      
      log(`- ${pkg}: ${current} → ${latest} (wanted: ${wanted})`);
      updates.push({ pkg, current, latest, location, dependent });
    }
    
    if (updates.length === 0) {
      log('✅ No updates available.');
      return [];
    }
    
    if (CONFIG.dryRun) {
      log('\n🚧 Dry run: No updates will be applied.');
      return updates.map(u => u.pkg);
    }
    
    if (!CONFIG.force) {
      log('\n💡 Run with --force to update these dependencies.');
      return [];
    }
    
    // Update packages
    log('\n🔄 Updating dependencies...');
    const updateCommand = 'npm update --save';
    execSync(updateCommand, { stdio: 'inherit' });
    
    log('✅ Dependencies updated successfully');
    return updates.map(u => u.pkg);
    
  } catch (error) {
    // If there are no outdated packages, npm outdated exits with code 1
    if (error.status === 1) {
      log('✅ All dependencies are up to date.');
      return [];
    }
    
    console.error('❌ Error checking for outdated dependencies:', error.message);
    return [];
  }
}

/**
 * Audit dependencies for known vulnerabilities
 */
async function auditDependencies() {
  log('\n🔒 Auditing dependencies for known vulnerabilities...');
  
  try {
    const auditOutput = execSync('npm audit --json', { encoding: 'utf8' });
    const audit = JSON.parse(auditOutput);
    
    if (audit.vulnerabilities && Object.keys(audit.vulnerabilities).length > 0) {
      log(`\n⚠️  Found ${Object.keys(audit.vulnerabilities).length} vulnerabilities:`);
      
      for (const [severity, count] of Object.entries(audit.metadata.vulnerabilities)) {
        if (count > 0) {
          log(`- ${severity}: ${count}`);
        }
      }
      
      if (!CONFIG.force) {
        log('\n💡 Run `npm audit fix` to fix automatically, or run with --force to fix now.');
      } else {
        log('\n🔧 Attempting to fix vulnerabilities...');
        execSync('npm audit fix --force', { stdio: 'inherit' });
        log('✅ Vulnerabilities fixed');
      }
      
      return audit.vulnerabilities;
    } else {
      log('✅ No known vulnerabilities found.');
      return {};
    }
  } catch (error) {
    console.error('❌ Error auditing dependencies:', error.message);
    return {};
  }
}

/**
 * Main function
 */
async function main() {
  log('🚀 Starting dependency cleanup...');
  
  // 1. Find unused dependencies
  const { 
    unusedDependencies, 
    unusedDevDependencies, 
    missingDependencies,
    usingDependencies
  } = await findUnusedDependencies();
  
  // 2. Remove unused dependencies
  const removedDeps = await removeUnusedDependencies(unusedDependencies, false);
  const removedDevDeps = await removeUnusedDependencies(unusedDevDependencies, true);
  
  // 3. Install missing dependencies
  const installedDeps = await installMissingDependencies(missingDependencies);
  
  // 4. Update outdated dependencies
  const updatedDeps = await updateDependencies();
  
  // 5. Audit for vulnerabilities
  const vulnerabilities = await auditDependencies();
  
  // 6. Generate a report
  const report = {
    timestamp: new Date().toISOString(),
    removedDependencies: removedDeps,
    removedDevDependencies: removedDevDeps,
    installedDependencies: installedDeps,
    updatedDependencies: updatedDeps,
    vulnerabilities: Object.keys(vulnerabilities).length > 0 ? vulnerabilities : 'No vulnerabilities found',
    usingDependencies: usingDependencies,
  };
  
  // Save the report
  const reportPath = path.join(process.cwd(), 'reports', 'dependency-cleanup.json');
  await writeFile(reportPath, JSON.stringify(report, null, 2));
  
  log(`\n📊 Cleanup complete! Report saved to: ${reportPath}`);
  
  // Exit with appropriate status code
  const hasVulnerabilities = vulnerabilities && Object.keys(vulnerabilities).length > 0;
  const hasUnusedDeps = (unusedDependencies.length + unusedDevDependencies.length) > 0;
  const hasMissingDeps = missingDependencies.length > 0;
  
  if (hasVulnerabilities || hasUnusedDeps || hasMissingDeps) {
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('❌ Error during dependency cleanup:', error);
  process.exit(1);
});
