import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jkczxfgogacjhpkygvns.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprY3p4ZmdvZ2Fjamhwa3lndm5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NDUyMDUsImV4cCI6MjA5ODEyMTIwNX0.31dBZ2Z67eLyXR4hCUPV_8-UDOS9iQIVnxOGU14Bh3Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSingleUpdate() {
  // Let's fetch one row from issues
  const { data: issues } = await supabase.from('issues').select('issue_id, area, category, status').limit(1);
  if (!issues || issues.length === 0) {
    console.log("No issues found");
    return;
  }
  const target = issues[0];
  console.log("Target issue before update:", target);

  // Try updating it by issue_id
  const { data: updated, error } = await supabase
    .from('issues')
    .update({ status: 'In Progress' })
    .eq('issue_id', target.issue_id)
    .select();

  console.log("Single update response:", { updated, error });
}

testSingleUpdate();
