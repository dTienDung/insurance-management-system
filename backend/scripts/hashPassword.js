const bcrypt = require('bcryptjs');

/**
 * Script helper để tạo hash password
 * Chạy: node hashPassword.js
 */

const plainPassword = 'admin123'; // Thay đổi password tại đây
const saltRounds = 10;

const hashedPassword = bcrypt.hashSync(plainPassword, saltRounds);

console.log('\n=== PASSWORD HASH GENERATOR ===\n');
console.log('Plain Password:', plainPassword);
console.log('Hashed Password:', hashedPassword);
console.log('\nCopy hash này vào SQL script seed-data.sql\n');

// Test verify
const isMatch = bcrypt.compareSync(plainPassword, hashedPassword);
console.log('Verification test:', isMatch ? '✅ PASS' : '❌ FAIL');
console.log('\n===============================\n');
