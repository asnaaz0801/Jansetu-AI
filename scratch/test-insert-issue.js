import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
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

async function testInsert() {
  const generatedUuid = crypto.randomUUID();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const generatedId = `JSA-2026-${randomNum}`;
  
  const payload = {
    issue_id: generatedUuid,
    reference_code: generatedId,
    email_id: 'test_citizen@example.com', // new column we want to test
    title: 'Test Issue with email_id',
    description: 'This is a test description of at least thirty characters long.',
    category: 'Roads',
    constituency: 'Central Delhi',
    state: 'Delhi',
    status: 'open',
    citizen_name: 'Test Submitter Email',
    created_at: new Date().toISOString()
  };

  console.log("Inserting payload with email_id into active DB...");
  const { data, error } = await supabase
    .from('issues')
    .insert(payload)
    .select('*')
    .single();

  if (error) {
    console.log("Insert failed! Details:");
    console.log("  Message:", error.message);
    console.log("  Code:", error.code);
  } else {
    console.log("Insert SUCCEEDED! (This means the email_id column already exists):", data);
    // Cleanup
    await supabase.from('issues').delete().eq('issue_id', generatedUuid);
  }
}

testInsert();
