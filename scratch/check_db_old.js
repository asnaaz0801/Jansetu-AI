import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jkczxfgogacjhpkygvns.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprY3p4ZmdvZ2Fjamhwa3lndm5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NDUyMDUsImV4cCI6MjA5ODEyMTIwNX0.31dBZ2Z67eLyXR4hCUPV_8-UDOS9iQIVnxOGU14Bh3Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data, error } = await supabase.from('issues').select('*').limit(1);
  if (error) {
    console.error("Error fetching:", error);
  } else if (data && data.length > 0) {
    console.log("Columns present in jkczxfgogacjhpkygvns issues table:", Object.keys(data[0]));
    console.log("First record:", data[0]);
  } else {
    console.log("No records found in jkczxfgogacjhpkygvns database issues table.");
  }
}

check();
