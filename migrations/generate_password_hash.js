// Utility script to generate bcrypt password hash for seed data
// Usage: node migrations/generate_password_hash.js [password]
// Default password: Password123!

import bcrypt from 'bcryptjs';

const password = process.argv[2] || 'Password123!';
const saltRounds = 10;

bcrypt.hash(password, saltRounds)
  .then((hash) => {
    console.log('Password:', password);
    console.log('Hash:', hash);
    console.log('\nCopy the hash above to replace password_hash in 003_seed_profiles_data.sql');
  })
  .catch((error) => {
    console.error('Error generating hash:', error);
    process.exit(1);
  });

