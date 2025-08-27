import { defineConfig } from 'cypress';
import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';
import { setupNodeEvents } from './cypress/plugins';
import * as fs from 'fs';
import * as path from 'path';

// Add coverage support to the config
export default defineConfig({
  e2e: {
    ...nxE2EPreset(__dirname, {
      bundler: 'vite',
    }),
    setupNodeEvents(on, config) {
      // Add coverage support
      require('@cypress/code-coverage/task')(on, config);
      
      // Ensure coverage folder exists
      const coverageDir = path.join(__dirname, 'coverage');
      if (!fs.existsSync(coverageDir)) {
        fs.mkdirSync(coverageDir, { recursive: true });
      }
      
      return config;
    },
    baseUrl: 'http://localhost:4200',
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    viewportWidth: 1280,
    viewportHeight: 800,
    setupNodeEvents,
    env: {
      apiUrl: 'http://localhost:3000/api',
    },
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
});
