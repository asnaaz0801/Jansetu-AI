import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jkczxfgogacjhpkygvns.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprY3p4ZmdvZ2Fjamhwa3lndm5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NDUyMDUsImV4cCI6MjA5ODEyMTIwNX0.31dBZ2Z67eLyXR4hCUPV_8-UDOS9iQIVnxOGU14Bh3Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkRLS() {
  console.log("Checking if we can update the status of kalamna + Water Supply...");
  
  // 1. Try to update using anon key
  const { data, error } = await supabase
    .from('issues')
    .update({ status: 'In Progress' })
    .eq('area', 'kalamna')
    .eq('category', 'Water Supply')
    .select();

  console.log("Update response:", { data, error });
}

checkRLS();
