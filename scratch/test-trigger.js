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

async function testTrigger() {
  const payload = {
    title: 'Test Trigger Check ' + Date.now(),
    description: 'This is a test description of at least thirty characters long.',
    category: 'Roads',
    constituency: 'Central Delhi',
    state: 'Delhi',
    status: 'open',
    citizen_name: 'Test Submitter Trigger Check'
  };

  console.log("Inserting payload WITHOUT IDs to check database-side triggers...");
  const { data, error } = await supabase
    .from('issues')
    .insert(payload)
    .select('*')
    .single();

  if (error) {
    console.error("Insert failed with error:", error);
  } else {
    console.log("Insert SUCCEEDED!");
    console.log("Returned details from DB:");
    console.log("  issue_id:", data.issue_id);
    console.log("  reference_code:", data.reference_code);
    console.log("  created_at:", data.created_at);
    
    // Cleanup if it inserted
    if (data.issue_id) {
      await supabase.from('issues').delete().eq('issue_id', data.issue_id);
    }
  }
}

testTrigger();
