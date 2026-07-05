import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jkczxfgogacjhpkygvns.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprY3p4ZmdvZ2Fjamhwa3lndm5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NDUyMDUsImV4cCI6MjA5ODEyMTIwNX0.31dBZ2Z67eLyXR4hCUPV_8-UDOS9iQIVnxOGU14Bh3Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log("Querying issues with aliases...");
  const { data, error } = await supabase
    .from('issues')
    .select('id:reference_code, category, ward:constituency, urgency:severity, description, lat:latitude, lng:longitude')
    .limit(5);
  
  if (error) {
    console.error("Query failed:", error.message);
  } else {
    console.log("Query succeeded! Sample row:", data[0]);
  }
}

test();
