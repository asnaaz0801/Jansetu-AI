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

async function inspectActiveColumns() {
  const { data, error } = await supabase.from('issues').select('*').limit(1);
  if (error) {
    console.error("Error fetching issue:", error);
  } else if (data && data.length > 0) {
    console.log("Columns present in ACTIVE issues table:", Object.keys(data[0]));
  } else {
    console.log("No issues found in ACTIVE database to inspect columns.");
  }
}

inspectActiveColumns();
