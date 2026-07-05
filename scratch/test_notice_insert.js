import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jkczxfgogacjhpkygvns.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprY3p4ZmdvZ2Fjamhwa3lndm5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NDUyMDUsImV4cCI6MjA5ODEyMTIwNX0.31dBZ2Z67eLyXR4hCUPV_8-UDOS9iQIVnxOGU14Bh3Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data, error } = await supabase.rpc('get_table_info', { table_name: 'mp_notices' });
  console.log("RPC get_table_info:", { data, error });
  
  // Let's try to query schema directly using SQL if allowed, or just do a test insert with status field.
  const testPayload = {
    area: 'test_area',
    category: 'Roads',
    notice: 'test_notice',
    mp_name: 'test_mp',
    constituency: 'test_constituency',
    status: 'Pending'
  };
  const { data: insData, error: insErr } = await supabase.from('mp_notices').insert(testPayload).select();
  console.log("Insert result with status field:", { insData, insErr });
}

run();
