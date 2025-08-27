const { exec } = require('child_process');

console.log('Starting test execution...');

const testProcess = exec('npx vitest run src/test/simple.test.ts --reporter=verbose', 
  { cwd: __dirname, maxBuffer: 1024 * 1024 * 5 },
  (error, stdout, stderr) => {
    console.log('--- STDOUT ---');
    console.log(stdout || '(no output)');
    
    if (stderr) {
      console.error('--- STDERR ---');
      console.error(stderr);
    }
    
    if (error) {
      console.error('--- ERROR ---');
      console.error(error);
    }
  }
);

testProcess.stdout.on('data', (data) => {
  console.log(data.toString());
});

testProcess.stderr.on('data', (data) => {
  console.error(data.toString());
});
