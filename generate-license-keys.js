// Simple license key generator for ThymeSheet
// Run with: node generate-license-keys.js <number_of_keys>

const crypto = require('crypto');

function generateLicenseKey() {
  // Generate random bytes and convert to base36
  const randomPart1 = crypto.randomBytes(4).toString('hex').toUpperCase().substring(0, 4);
  const randomPart2 = crypto.randomBytes(4).toString('hex').toUpperCase().substring(0, 4);
  const randomPart3 = crypto.randomBytes(4).toString('hex').toUpperCase().substring(0, 4);

  return `THYME-${randomPart1}-${randomPart2}-${randomPart3}`;
}

// Get number of keys to generate from command line
const numKeys = parseInt(process.argv[2]) || 5;

console.log(`\nGenerating ${numKeys} ThymeSheet License Keys:\n`);
console.log('='.repeat(60));

const keys = [];
for (let i = 0; i < numKeys; i++) {
  const key = generateLicenseKey();
  keys.push(key);
  console.log(`${(i + 1).toString().padStart(2, ' ')}. ${key}`);
}

console.log('='.repeat(60));
console.log('\nTo add these keys to your app:');
console.log('1. Open main.js');
console.log('2. Find the "validLicenseKeys" array');
console.log('3. Add these keys to the array\n');
console.log('Example format:');
console.log('const validLicenseKeys = [');
keys.forEach(key => {
  console.log(`  '${key}',`);
});
console.log('];\n');
