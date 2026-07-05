import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jkczxfgogacjhpkygvns.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprY3p4ZmdvZ2Fjamhwa3lndm5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NDUyMDUsImV4cCI6MjA5ODEyMTIwNX0.31dBZ2Z67eLyXR4hCUPV_8-UDOS9iQIVnxOGU14Bh3Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
  const payload = {
    citizen_id: '00000000-0000-0000-0000-000000000001',
    title: 'Test Issue ' + Date.now(),
    description: 'This is a test description of at least thirty characters long.',
    category: 'Roads',
    constituency: 'Central Delhi',
    state: 'Delhi',
    status: 'Pending',
    citizen_name: 'Test Submitter'
  };

  console.log("Inserting payload into OLD DB:", payload);
  const { data, error } = await supabase
    .from('issues')
    .insert(payload)
    .select('*')
    .single();

  if (error) {
    console.error("Insert failed with error:", error);
  } else {
    console.log("Insert succeeded!");
    console.log("Returned row details:");
    console.log(`  issue_id: ${data.issue_id}`);
    console.log(`  reference_code: ${data.reference_code}`);
    console.log(`  created_at: ${data.created_at}`);
  }
}

testInsert();
