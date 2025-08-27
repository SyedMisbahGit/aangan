console.log('Running direct test...');
console.log('1 + 1 =', 1 + 1);

// Simple test assertion
const assert = (condition, message) => {
  if (!condition) {
    console.error(`❌ Test failed: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ Test passed: ${message}`);
  }
};

// Run a simple test
assert(1 + 1 === 2, '1 + 1 should equal 2');
console.log('All tests completed successfully!');
