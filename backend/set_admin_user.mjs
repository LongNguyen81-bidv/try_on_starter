// Utility script to set a user as admin
// Usage: cd backend && node set_admin_user.mjs [email]
// Example: node set_admin_user.mjs user@example.com

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from current directory (backend)
const envPath = join(__dirname, '.env');

if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase environment variables');
  console.error('Please make sure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in backend/.env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const email = process.argv[2];

if (!email) {
  console.error('❌ Error: Email is required');
  console.error('Usage: node set_admin_user.mjs [email]');
  console.error('Example: node set_admin_user.mjs user@example.com');
  process.exit(1);
}

async function setAdminUser() {
  try {
    console.log(`\n🔍 Looking for user with email: ${email}...`);

    // Find user by email
    const { data: profile, error: findError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (findError) {
      if (findError.code === 'PGRST116') {
        console.error(`❌ Error: User with email "${email}" not found`);
        console.error('Please make sure the user exists in the database');
        process.exit(1);
      }
      throw findError;
    }

    if (profile.role === 'admin') {
      console.log(`✅ User "${email}" is already an admin`);
      console.log(`   User ID: ${profile.id}`);
      console.log(`   Current role: ${profile.role}`);
      return;
    }

    console.log(`📝 Current role: ${profile.role}`);
    console.log(`🔄 Updating role to 'admin'...`);

    // Update role to admin
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', profile.id)
      .select('id, email, role')
      .single();

    if (updateError) {
      throw updateError;
    }

    console.log(`\n✅ Success! User has been set as admin:`);
    console.log(`   User ID: ${updatedProfile.id}`);
    console.log(`   Email: ${updatedProfile.email}`);
    console.log(`   Role: ${updatedProfile.role}`);
    console.log(`\n💡 Note: User needs to log out and log in again for the new role to take effect in JWT token.\n`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setAdminUser();

