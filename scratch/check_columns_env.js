import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read .env.local
const envPath = path.resolve('.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const urlMatch = envContent.match(/^VITE_SUPABASE_URL\s*=\s*(.*)/m);
const keyMatch = envContent.match(/^VITE_SUPABASE_ANON_KEY\s*=\s*(.*)/m);

if (!urlMatch || !keyMatch) {
  console.error("Could not parse VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY from .env.local");
  process.exit(1);
}

const supabaseUrl = urlMatch[1].trim();
const supabaseAnonKey = keyMatch[1].trim();

console.log("Supabase URL:", supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectColumns() {
  const { data, error } = await supabase.from('issues').select('*').limit(1);
  if (error) {
    console.error("Error fetching issue from issues:", error);
  } else if (data && data.length > 0) {
    console.log("Columns present in issues table:", Object.keys(data[0]));
    console.log("Sample issue row:", JSON.stringify(data[0], null, 2));
  } else {
    console.log("No issues found in issues table.");
  }
}

inspectColumns();
