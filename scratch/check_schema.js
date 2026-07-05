import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jkczxfgogacjhpkygvns.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprY3p4ZmdvZ2Fjamhwa3lndm5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NDUyMDUsImV4cCI6MjA5ODEyMTIwNX0.31dBZ2Z67eLyXR4hCUPV_8-UDOS9iQIVnxOGU14Bh3Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectTable() {
  const { data, error } = await supabase.from('issues').select('*').limit(5);
  if (error) {
    console.error("Error fetching issues:", error);
    return;
  }
  
  if (data && data.length > 0) {
    console.log("Sample issues:");
    data.forEach((row, i) => {
      console.log(`\nRow ${i+1}:`);
      console.log(`  issue_id: ${row.issue_id}`);
      console.log(`  title: ${row.title}`);
      console.log(`  latitude: ${row.latitude} (type: ${typeof row.latitude})`);
      console.log(`  longitude: ${row.longitude} (type: ${typeof row.longitude})`);
      console.log(`  geolocation:`, row.geolocation, `(type: ${typeof row.geolocation})`);
      console.log(`  constituency: ${row.constituency}`);
      console.log(`  state: ${row.state}`);
      console.log(`  district: ${row.district}`);
      console.log(`  city: ${row.city}`);
      console.log(`  area: ${row.area}`);
      console.log(`  pincode: ${row.pincode}`);
    });
  } else {
    console.log("No issues found in table.");
  }
}

inspectTable();
