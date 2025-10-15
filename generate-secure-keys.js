// Secure License Key Generator for ThymeSheet
// Uses cryptographic checksums - no key list needed in the app!
// Run with: node generate-secure-keys.js <number_of_keys>

const crypto = require('crypto');

// IMPORTANT: This is your SECRET - keep it safe and NEVER share it!
// This MUST match the LICENSE_SECRET in main.js
const LICENSE_SECRET = 'ThymeSheetSecretKey2024!';

function generateRandomPart() {
  // Generate a random 4-character alphanumeric string
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function calculateChecksum(part1, part2, secret) {
  const data = secret + part1 + part2;
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  return hash.substring(0, 4).toUpperCase();
}

function generateLicenseKey() {
  const part1 = generateRandomPart();
  const part2 = generateRandomPart();
  const checksum = calculateChecksum(part1, part2, LICENSE_SECRET);

  return `THYME-${part1}-${part2}-${checksum}`;
}

// Get number of keys to generate from command line
const numKeys = parseInt(process.argv[2]) || 5;

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║        ThymeSheet Secure License Key Generator            ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

console.log(`Generating ${numKeys} cryptographically valid license keys...\n`);
console.log('─'.repeat(60));

const keys = [];
for (let i = 0; i < numKeys; i++) {
  const key = generateLicenseKey();
  keys.push(key);
  console.log(`${(i + 1).toString().padStart(3, ' ')}. ${key}`);
}

console.log('─'.repeat(60));
console.log('\n📋 IMPORTANT INSTRUCTIONS:\n');
console.log('1. Copy these keys to a secure location (password manager, encrypted file)');
console.log('2. Give ONE key to each authorized user');
console.log('3. Track which key goes to which user');
console.log('4. Each key works on ONE computer only\n');

console.log('💾 RECOMMENDED: Create a tracking spreadsheet:\n');
console.log('   License Key              | Issued To      | Date       | Status');
console.log('   ─────────────────────────┼────────────────┼────────────┼─────────');
keys.forEach((key, i) => {
  console.log(`   ${key}     | Person ${i+1}       | ${new Date().toISOString().split('T')[0]}    | Pending`);
});

console.log('\n🔐 SECURITY NOTES:');
console.log('   • Keys are mathematically generated - no list stored in app');
console.log('   • You can generate unlimited keys with this script');
console.log('   • Keep this script and your SECRET safe!');
console.log('   • Never share your LICENSE_SECRET with anyone\n');
