// ESM-compatible test file
import { strict as assert } from 'node:assert';
import { fileURLToPath } from 'node:url';

// Simple test
function testAddition() {
  console.log('Running ESM test: 1 + 1 should equal 2');
  assert.strictEqual(1 + 1, 2, '1 + 1 should be 2');
  console.log('✅ Test passed!');
}

// Run the test
try {
  testAddition();
  console.log('All tests passed!');
  process.exit(0);
} catch (error) {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
}
