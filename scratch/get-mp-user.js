import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const getEnvVar = (name) => {
  const match = envContent.match(new RegExp(`^\\s*${name}\\s*=\\s*(.*)$`, 'm'));
  return match ? match[1].trim() : null;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function getMpUser() {
  const { data, error } = await supabase.from('mp_users').select('*').limit(3);
  if (error) {
    console.error("Error fetching mp_users:", error);
  } else {
    console.log("MP Users in database:");
    data.forEach((user) => {
      console.log(`- Email: ${user.email}, Name: ${user.mp_name}, Password: ${user.password}`);
    });
  }
}

getMpUser();
