import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jkczxfgogacjhpkygvns.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprY3p4ZmdvZ2Fjamhwa3lndm5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NDUyMDUsImV4cCI6MjA5ODEyMTIwNX0.31dBZ2Z67eLyXR4hCUPV_8-UDOS9iQIVnxOGU14Bh3Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectColumns() {
  const { data, error } = await supabase.from('issues').select('*').limit(1);
  if (error) {
    console.error("Error fetching issue:", error);
  } else if (data && data.length > 0) {
    console.log("Columns present in issues table:", Object.keys(data[0]));
  } else {
    console.log("No issues found to inspect columns.");
    // Try inserting a dummy issue with citizen_name to see if it succeeds
    const payload = {
      citizen_id: '00000000-0000-0000-0000-000000000001',
      title: 'Inspect Dummy Pothole',
      description: 'This is a test description of at least thirty characters long.',
      category: 'Roads',
      constituency: 'Central Delhi',
      state: 'Delhi',
      latitude: 28.6139,
      longitude: 77.2090,
      status: 'Pending',
      citizen_name: 'Inspect Name Test'
    };
    const { data: insData, error: insErr } = await supabase.from('issues').insert(payload).select();
    if (insErr) {
      console.error("Insert failed:", insErr);
    } else {
      console.log("Insert succeeded with citizen_name! Columns:", Object.keys(insData[0]));
    }
  }
}

inspectColumns();
