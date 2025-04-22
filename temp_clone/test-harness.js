// Simple test harness to check functionality

function expect(actual) {
  return {
    toBe: (expected) => {
      if (actual !== expected) {
        throw new Error(`Expected ${actual} to be ${expected}`);
      }
      return true;
    },
    toEqual: (expected) => {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`);
      }
      return true;
    }
  };
}

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    return true;
  } catch (e) {
    console.error(`✗ ${name}`);
    console.error(`  ${e.message}`);
    return false;
  }
}

// Run a simple set of tests
let passed = 0;
let failed = 0;

// Test 1
if (test('1 + 2 = 3', () => {
  expect(1 + 2).toBe(3);
})) {
  passed++;
} else {
  failed++;
}

// Test 2
if (test('Objects should be equal', () => {
  expect({ a: 1, b: 2 }).toEqual({ a: 1, b: 2 });
})) {
  passed++;
} else {
  failed++;
}

// Test 3 (this should fail)
if (test('This test should fail', () => {
  expect(1).toBe(2);
})) {
  passed++;
} else {
  failed++;
}

console.log(`\nResults: ${passed} passed, ${failed} failed`);