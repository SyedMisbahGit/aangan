import { FullConfig, chromium } from '@playwright/test';
import { createServer } from 'http';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

/**
 * Global setup function that runs before all tests.
 * Starts the Storybook server if not already running.
 */
async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  const server = createServer();
  
  // Check if the server is already running
  const isServerRunning = await new Promise<boolean>((resolve) => {
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(6006, '127.0.0.1');
  });

  // If server is not running, start it
  if (!isServerRunning) {
    console.log('Starting Storybook server...');
    const { stdout, stderr } = await execAsync('npm run storybook -- --ci --port 6006');
    
    if (stderr) {
      console.error('Error starting Storybook:', stderr);
      process.exit(1);
    }
    
    console.log('Storybook server started successfully');
  } else {
    console.log('Storybook server is already running');
  }

  // Launch a browser instance for testing
  const browser = await chromium.launch({
    headless: !!process.env.CI,
    devtools: !process.env.CI,
  });
  
  // Store the browser instance in the global config
  (global as any).__BROWSER__ = browser;
  
  return async () => {
    // Close the browser when tests are done
    await browser.close();
  };
}

export default globalSetup;
