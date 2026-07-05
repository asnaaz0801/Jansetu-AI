import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jkczxfgogacjhpkygvns.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprY3p4ZmdvZ2Fjamhwa3lndm5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NDUyMDUsImV4cCI6MjA5ODEyMTIwNX0.31dBZ2Z67eLyXR4hCUPV_8-UDOS9iQIVnxOGU14Bh3Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
  const payload = {
    citizen_id: '00000000-0000-0000-0000-000000000001',
    title: 'Test Geolocation Insertion',
    description: 'This is a test description of at least thirty characters long.',
    category: 'Other',
    constituency: 'Central Delhi',
    state: 'Delhi',
    latitude: 28.6139,
    longitude: 77.2090,
    geolocation: 'POINT(77.2090 28.6139)',
    status: 'Pending',
    citizen_name: 'Test Geo'
  };

  const { data, error } = await supabase.from('issues').insert(payload).select();
  if (error) {
    console.error("Insert failed:", error);
  } else {
    console.log("Insert succeeded!", data);
    // Delete the inserted test row
    if (data && data[0]) {
      const { error: delErr } = await supabase.from('issues').delete().eq('issue_id', data[0].issue_id);
      if (delErr) {
        console.error("Delete failed:", delErr);
      } else {
        console.log("Deleted test row successfully");
      }
    }
  }
}

testInsert();
