// .chromatic.js
module.exports = {
  // Project token for Chromatic (set via environment variable CHROMATIC_PROJECT_TOKEN)
  projectToken: process.env.CHROMATIC_PROJECT_TOKEN,
  
  // The base branch that git branches are based on
  buildBranchBase: 'main',
  
  // The branch that gets deployed to production
  buildBranch: 'main',
  
  // The working directory for the build
  workingDir: 'frontend',
  
  // The storybook build directory
  buildDir: 'storybook-static',
  
  // Enable Chromatic's TurboSnap feature
  turboSnap: {
    // Enable for all stories
    enabled: true,
    
    // Fail build if there are any visual changes
    failOnChanges: process.env.CI === 'true',
    
    // Only include stories that have changed
    onlyChanged: true,
  },
  
  // Configure the viewports for visual testing
  viewports: [
    { name: 'mobile', width: 320, height: 568 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1280, height: 1024 },
  ],
  
  // Enable interactive stories
  experimentalInteractiveRunBeforeScreenshot: true,
  
  // Configure the build script
  buildScriptName: 'build-storybook',
  
  // Configure the start script
  startScriptName: 'storybook',
  
  // Configure the test script
  testScriptName: 'test-storybook',
  
  // Configure the storybook build directory
  storybookBuildDir: 'storybook-static',
  
  // Configure the storybook config directory
  storybookConfigDir: '.storybook',
  
  // Configure the storybook version
  storybookVersion: '7.0.0',
  
  // Configure the storybook URL
  storybookUrl: 'http://localhost:6006',
  
  // Configure the storybook port
  storybookPort: 6006,
  
  // Configure the storybook host
  storybookHost: 'localhost',
  
  // Configure the storybook protocol
  storybookProtocol: 'http',
  
  // Configure the storybook path
  storybookPath: '/',
  
  // Configure the storybook static directory
  storybookStaticDir: 'public',
  
  // Configure the storybook output directory
  storybookOutputDir: 'storybook-static',
};
