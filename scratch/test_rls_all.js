import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jkczxfgogacjhpkygvns.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprY3p4ZmdvZ2Fjamhwa3lndm5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NDUyMDUsImV4cCI6MjA5ODEyMTIwNX0.31dBZ2Z67eLyXR4hCUPV_8-UDOS9iQIVnxOGU14Bh3Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runTest() {
  const payload = {
    citizen_id: '00000000-0000-0000-0000-000000000001',
    title: 'Test RLS Policies',
    description: 'This is a test description of at least thirty characters long.',
    category: 'Other',
    constituency: 'Central Delhi',
    state: 'Delhi',
    status: 'Pending',
    citizen_name: 'Test RLS'
  };

  console.log("Inserting...");
  const { data: insData, error: insErr } = await supabase.from('issues').insert(payload).select();
  if (insErr) {
    console.error("Insert failed:", insErr);
    return;
  }
  const row = insData[0];
  console.log("Inserted row:", row);

  console.log("Attempting to update status to 'In Progress'...");
  const { data: updData, error: updErr } = await supabase
    .from('issues')
    .update({ status: 'In Progress' })
    .eq('issue_id', row.issue_id)
    .select();

  console.log("Update result:", { updData, updErr });

  console.log("Deleting...");
  const { error: delErr } = await supabase.from('issues').delete().eq('issue_id', row.issue_id);
  console.log("Delete result:", delErr || "Success");
}

runTest();
