#!/usr/bin/env node

/**
 * Aangan Staging Readiness Validator
 * Comprehensive validation script to verify all deliverables before GCP staging deployment
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for better output
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

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.cyan}${colors.bright}🔍 ${msg}${colors.reset}\n`),
  subsection: (msg) => console.log(`${colors.magenta}  📋 ${msg}${colors.reset}`)
};

class StagingValidator {
  constructor() {
    this.results = {
      frontend: { passed: 0, failed: 0, warnings: 0 },
      backend: { passed: 0, failed: 0, warnings: 0 },
      security: { passed: 0, failed: 0, warnings: 0 },
      integration: { passed: 0, failed: 0, warnings: 0 },
      observability: { passed: 0, failed: 0, warnings: 0 },
      cicd: { passed: 0, failed: 0, warnings: 0 }
    };
    
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
    this.warnings = 0;
    
    this.startTime = Date.now();
  }

  exec(command, options = {}) {
    try {
      const result = execSync(command, { 
        encoding: 'utf8',
        stdio: options.silent ? 'pipe' : 'inherit',
        ...options
      });
      return { success: true, output: result };
    } catch (error) {
      return { 
        success: false, 
        output: error.stdout || error.stderr || error.message,
        error: error
      };
    }
  }

  checkFile(filePath) {
    return fs.existsSync(filePath);
  }

  recordResult(category, passed, message) {
    this.totalTests++;
    
    if (passed) {
      this.passedTests++;
      this.results[category].passed++;
      log.success(message);
    } else {
      this.failedTests++;
      this.results[category].failed++;
      log.error(message);
    }
  }

  recordWarning(category, message) {
    this.warnings++;
    this.results[category].warnings++;
    log.warning(message);
  }

  async validateFrontendTypeScript() {
    log.section('Frontend TypeScript Validation');
    
    // Check if TypeScript config is strict
    log.subsection('Checking TypeScript configuration');
    const tsConfig = JSON.parse(fs.readFileSync('frontend/tsconfig.json', 'utf8'));
    const strictChecks = [
      'strict',
      'noImplicitAny',
      'strictNullChecks',
      'noUnusedLocals',
      'noUnusedParameters',
      'noImplicitReturns',
      'noFallthroughCasesInSwitch'
    ];
    
    let strictConfigPassed = true;
    strictChecks.forEach(check => {
      if (!tsConfig.compilerOptions[check]) {
        log.error(`TypeScript config missing: ${check}`);
        strictConfigPassed = false;
      }
    });
    
    this.recordResult('frontend', strictConfigPassed, 
      strictConfigPassed ? 'TypeScript config is properly configured with strict mode' 
                        : 'TypeScript config needs strict mode configuration');

    // Run TypeScript check
    log.subsection('Running TypeScript compilation check');
    const tsResult = this.exec('cd frontend && npm run typecheck', { silent: true });
    
    this.recordResult('frontend', tsResult.success, 
      tsResult.success ? 'Frontend TypeScript compilation: ZERO errors' 
                      : 'Frontend TypeScript compilation: ERRORS FOUND');

    if (!tsResult.success) {
      console.log('\nTypeScript Errors:');
      console.log(tsResult.output);
    }
  }

  async validateBackendTypeScript() {
    log.subsection('Running backend TypeScript check');
    const tsResult = this.exec('cd backend && npm run type-check', { silent: true });
    
    this.recordResult('backend', tsResult.success,
      tsResult.success ? 'Backend TypeScript compilation: ZERO errors'
                      : 'Backend TypeScript compilation: ERRORS FOUND');

    if (!tsResult.success) {
      console.log('\nBackend TypeScript Errors:');
      console.log(tsResult.output);
    }
  }

  async validateESLint() {
    log.section('ESLint Validation');
    
    // Frontend ESLint
    log.subsection('Frontend ESLint check');
    const frontendLintResult = this.exec('cd frontend && npm run lint', { silent: true });
    this.recordResult('frontend', frontendLintResult.success,
      frontendLintResult.success ? 'Frontend ESLint: ZERO warnings/errors'
                                 : 'Frontend ESLint: WARNINGS/ERRORS FOUND');

    // Backend ESLint
    log.subsection('Backend ESLint check');
    const backendLintResult = this.exec('cd backend && npm run lint', { silent: true });
    this.recordResult('backend', backendLintResult.success,
      backendLintResult.success ? 'Backend ESLint: ZERO warnings/errors'
                                : 'Backend ESLint: WARNINGS/ERRORS FOUND');
  }

  async validateTests() {
    log.section('Test Suite Validation');
    
    // Check if test files exist
    const testFiles = [
      'backend/__tests__/integration/websocket.test.js',
      'backend/__tests__/integration/security.test.js'
    ];
    
    testFiles.forEach(testFile => {
      const exists = this.checkFile(testFile);
      this.recordResult('integration', exists, 
        exists ? `Test file exists: ${testFile}` 
               : `Missing test file: ${testFile}`);
    });

    // Run integration tests
    log.subsection('Running integration tests');
    const integrationResult = this.exec('cd backend && npm test -- --testPathPattern=integration', { silent: true });
    this.recordResult('integration', integrationResult.success,
      integrationResult.success ? 'Integration tests: ALL PASSING'
                                : 'Integration tests: FAILURES DETECTED');

    if (!integrationResult.success) {
      console.log('\nTest Failures:');
      console.log(integrationResult.output);
    }
  }

  async validateSecurity() {
    log.section('Security Configuration Validation');
    
    // Check security middleware files
    const securityFiles = [
      'backend/src/middleware/security.js'
    ];
    
    securityFiles.forEach(file => {
      const exists = this.checkFile(file);
      this.recordResult('security', exists,
        exists ? `Security middleware exists: ${file}`
               : `Missing security middleware: ${file}`);
    });

    // Validate security configurations
    log.subsection('Validating security configurations');
    
    // Check for JWT secrets in environment
    const hasJwtSecrets = process.env.JWT_ACCESS_SECRET && process.env.JWT_REFRESH_SECRET;
    if (!hasJwtSecrets) {
      this.recordWarning('security', 'JWT secrets not set in environment (OK for dev)');
    } else {
      this.recordResult('security', true, 'JWT secrets configured');
    }

    // Check package vulnerabilities
    log.subsection('Running security audit');
    const auditResult = this.exec('cd backend && npm audit --audit-level moderate', { silent: true });
    this.recordResult('security', auditResult.success,
      auditResult.success ? 'Security audit: NO MODERATE/HIGH VULNERABILITIES'
                          : 'Security audit: VULNERABILITIES DETECTED');

    // Frontend security audit
    const frontendAuditResult = this.exec('cd frontend && npm audit --audit-level moderate', { silent: true });
    this.recordResult('security', frontendAuditResult.success,
      frontendAuditResult.success ? 'Frontend security audit: NO MODERATE/HIGH VULNERABILITIES'
                                  : 'Frontend security audit: VULNERABILITIES DETECTED');
  }

  async validateObservability() {
    log.section('Observability Infrastructure Validation');
    
    // Check observability files
    const observabilityFiles = [
      'backend/src/middleware/observability.js'
    ];
    
    observabilityFiles.forEach(file => {
      const exists = this.checkFile(file);
      this.recordResult('observability', exists,
        exists ? `Observability middleware exists: ${file}`
               : `Missing observability middleware: ${file}`);
    });

    // Check environment variables for observability
    log.subsection('Checking observability configuration');
    
    const gcpConfigured = process.env.GCP_PROJECT_ID && process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (!gcpConfigured) {
      this.recordWarning('observability', 'Google Cloud Logging not configured (OK for local dev)');
    } else {
      this.recordResult('observability', true, 'Google Cloud Logging configured');
    }

    const sentryConfigured = process.env.SENTRY_DSN && process.env.SENTRY_DSN !== 'https://your-sentry-dsn@sentry.io/project-id';
    if (!sentryConfigured) {
      this.recordWarning('observability', 'Sentry error tracking not configured (OK for local dev)');
    } else {
      this.recordResult('observability', true, 'Sentry error tracking configured');
    }
  }

  async validateCICD() {
    log.section('CI/CD Pipeline Validation');
    
    // Check GitHub Actions workflow files
    const workflowFiles = [
      '.github/workflows/quality-gate.yml',
      '.github/workflows/ci.yml'
    ];
    
    workflowFiles.forEach(file => {
      const exists = this.checkFile(file);
      this.recordResult('cicd', exists,
        exists ? `GitHub Actions workflow exists: ${file}`
               : `Missing GitHub Actions workflow: ${file}`);
    });

    // Validate workflow content
    log.subsection('Validating workflow configurations');
    
    if (this.checkFile('.github/workflows/quality-gate.yml')) {
      const workflowContent = fs.readFileSync('.github/workflows/quality-gate.yml', 'utf8');
      
      const requiredSteps = [
        'typecheck',
        'type-check',
        'lint',
        'test',
        'build'
      ];
      
      let workflowValid = true;
      requiredSteps.forEach(step => {
        if (!workflowContent.includes(step)) {
          log.error(`Missing step in workflow: ${step}`);
          workflowValid = false;
        }
      });
      
      this.recordResult('cicd', workflowValid,
        workflowValid ? 'Quality gate workflow includes all required steps'
                      : 'Quality gate workflow missing required steps');

      // Check for strict mode (fail-fast: true)
      const hasFailFast = workflowContent.includes('fail-fast: true');
      this.recordResult('cicd', hasFailFast,
        hasFailFast ? 'CI/CD configured with fail-fast mode'
                    : 'CI/CD should use fail-fast mode for strict quality gates');
    }
  }

  async validateBuilds() {
    log.section('Build Validation');
    
    // Frontend build
    log.subsection('Testing frontend build');
    const frontendBuildResult = this.exec('cd frontend && npm run build', { silent: true });
    this.recordResult('frontend', frontendBuildResult.success,
      frontendBuildResult.success ? 'Frontend build: SUCCESSFUL'
                                  : 'Frontend build: FAILED');

    if (!frontendBuildResult.success) {
      console.log('\nFrontend Build Errors:');
      console.log(frontendBuildResult.output);
    }

    // Check build output
    if (frontendBuildResult.success) {
      const distExists = this.checkFile('frontend/dist');
      this.recordResult('frontend', distExists,
        distExists ? 'Frontend build output exists'
                   : 'Frontend build output missing');
    }
  }

  async validateEnvironmentSetup() {
    log.section('Environment Setup Validation');
    
    // Check package.json scripts
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredScripts = [
      'typecheck',
      'lint',
      'test',
      'build'
    ];
    
    requiredScripts.forEach(script => {
      const exists = packageJson.scripts && packageJson.scripts[script];
      this.recordResult('frontend', exists,
        exists ? `Root package.json has ${script} script`
               : `Root package.json missing ${script} script`);
    });

    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.replace('v', '').split('.')[0]);
    const nodeVersionOk = majorVersion >= 18;
    
    this.recordResult('backend', nodeVersionOk,
      nodeVersionOk ? `Node.js version compatible: ${nodeVersion}`
                    : `Node.js version too old: ${nodeVersion} (need >= 18)`);
  }

  generateReport() {
    const duration = Date.now() - this.startTime;
    const successRate = ((this.passedTests / this.totalTests) * 100).toFixed(1);
    
    console.log('\n' + '='.repeat(80));
    log.section('🎯 STAGING READINESS VALIDATION REPORT');
    
    // Overall summary
    console.log(`${colors.bright}📊 Overall Results:${colors.reset}`);
    console.log(`   Total Tests: ${this.totalTests}`);
    console.log(`   ${colors.green}Passed: ${this.passedTests}${colors.reset}`);
    console.log(`   ${colors.red}Failed: ${this.failedTests}${colors.reset}`);
    console.log(`   ${colors.yellow}Warnings: ${this.warnings}${colors.reset}`);
    console.log(`   Success Rate: ${colors.bright}${successRate}%${colors.reset}`);
    console.log(`   Duration: ${(duration / 1000).toFixed(2)}s`);
    
    // Category breakdown
    console.log(`\n${colors.bright}📋 Category Breakdown:${colors.reset}`);
    Object.entries(this.results).forEach(([category, results]) => {
      const total = results.passed + results.failed;
      const categorySuccess = total > 0 ? ((results.passed / total) * 100).toFixed(1) : 0;
      const status = results.failed === 0 ? colors.green : colors.red;
      
      console.log(`   ${category.toUpperCase().padEnd(15)} ${status}${results.passed}/${total} (${categorySuccess}%)${colors.reset} ${results.warnings > 0 ? colors.yellow + results.warnings + ' warnings' + colors.reset : ''}`);
    });

    // Final determination
    const isReady = this.failedTests === 0;
    console.log('\n' + '='.repeat(80));
    
    if (isReady) {
      log.success('🚀 STAGING DEPLOYMENT: GO!');
      console.log(`${colors.green}${colors.bright}All quality gates passed. Aangan is ready for GCP staging deployment.${colors.reset}`);
      
      if (this.warnings > 0) {
        console.log(`${colors.yellow}⚠️  Note: ${this.warnings} warnings detected but do not block deployment.${colors.reset}`);
      }
      
      console.log('\n🎉 Next Steps:');
      console.log('   1. Set up GCP project and service account');
      console.log('   2. Configure environment variables for staging');
      console.log('   3. Run: npm run deploy:staging');
      console.log('   4. Verify staging deployment with smoke tests');
      
    } else {
      log.error('🛑 STAGING DEPLOYMENT: NO-GO');
      console.log(`${colors.red}${colors.bright}${this.failedTests} critical issues must be resolved before staging deployment.${colors.reset}`);
      
      console.log('\n🔧 Action Required:');
      console.log('   1. Fix all failing tests and validations');
      console.log('   2. Re-run validation: npm run validate:staging');
      console.log('   3. Ensure CI/CD pipeline passes');
    }

    return isReady;
  }

  async runAll() {
    console.log(`${colors.cyan}${colors.bright}🔍 Aangan Staging Readiness Validation${colors.reset}`);
    console.log(`${colors.blue}Validating all deliverables for production-grade staging deployment...${colors.reset}\n`);

    try {
      await this.validateEnvironmentSetup();
      await this.validateFrontendTypeScript();
      await this.validateBackendTypeScript();
      await this.validateESLint();
      await this.validateTests();
      await this.validateSecurity();
      await this.validateObservability();
      await this.validateCICD();
      await this.validateBuilds();
      
      return this.generateReport();
      
    } catch (error) {
      log.error(`Validation failed with error: ${error.message}`);
      console.error(error.stack);
      return false;
    }
  }
}

// Export for programmatic use
export { StagingValidator };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new StagingValidator();
  
  validator.runAll()
    .then(isReady => {
      process.exit(isReady ? 0 : 1);
    })
    .catch(error => {
      console.error('Validation script failed:', error);
      process.exit(1);
    });
}
