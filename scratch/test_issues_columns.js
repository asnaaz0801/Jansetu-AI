import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jkczxfgogacjhpkygvns.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprY3p4ZmdvZ2Fjamhwa3lndm5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NDUyMDUsImV4cCI6MjA5ODEyMTIwNX0.31dBZ2Z67eLyXR4hCUPV_8-UDOS9iQIVnxOGU14Bh3Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkColumns() {
  console.log("Checking columns in issues table...");
  const { data, error } = await supabase.from('issues').select('*').limit(1);
  if (error) {
    console.error("Error selecting issues:", error);
    return;
  }
  
  if (data && data.length > 0) {
    const columns = Object.keys(data[0]);
    console.log("Columns found in issues table:", columns);
    
    // Check if new columns exist
    const required = ['mp_comment', 'assigned_mp', 'updated_at', 'resolved_at'];
    required.forEach(col => {
      console.log(`Column '${col}' exists:`, columns.includes(col));
    });
  } else {
    console.log("No issues found to inspect.");
  }
}

checkColumns();
