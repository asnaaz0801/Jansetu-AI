import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jkczxfgogacjhpkygvns.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprY3p4ZmdvZ2Fjamhwa3lndm5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NDUyMDUsImV4cCI6MjA5ODEyMTIwNX0.31dBZ2Z67eLyXR4hCUPV_8-UDOS9iQIVnxOGU14Bh3Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectPolicies() {
  console.log("Fetching policies...");
  // Standard PostgREST doesn't expose system tables by default, but let's try querying pg_policies via a rpc if it exists,
  // or see if we can query it directly just in case pg_policies is exposed.
  const { data, error } = await supabase.from('pg_policies').select('*');
  if (error) {
    console.error("Direct pg_policies query failed:", error);
  } else {
    console.log("Policies:", data);
  }
}

inspectPolicies();
