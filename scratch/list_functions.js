import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jkczxfgogacjhpkygvns.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprY3p4ZmdvZ2Fjamhwa3lndm5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NDUyMDUsImV4cCI6MjA5ODEyMTIwNX0.31dBZ2Z67eLyXR4hCUPV_8-UDOS9iQIVnxOGU14Bh3Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  // Query RPC functions available in the public schema
  const { data, error } = await supabase.rpc('get_user_role'); // Let's check if we can query pg_catalog
  console.log("get_user_role test:", { data, error });
  
  // Let's try querying pg_proc from the REST API (if exposed, sometimes not)
  const { data: procData, error: procErr } = await supabase.from('pg_proc').select('*').limit(5);
  console.log("pg_proc directly:", { procData, procErr });
}

run();
