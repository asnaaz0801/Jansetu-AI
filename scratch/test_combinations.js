import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jkczxfgogacjhpkygvns.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprY3p4ZmdvZ2Fjamhwa3lndm5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NDUyMDUsImV4cCI6MjA5ODEyMTIwNX0.31dBZ2Z67eLyXR4hCUPV_8-UDOS9iQIVnxOGU14Bh3Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const combinations = [
  { area: 'Test', category: 'Roads', notice: 'Test notice text', mp_name: 'Nitin Gadkari', constituency: 'Nagpur' },
  { area: 'Test', category: 'Roads', notice: 'Test notice text', mp_name: 'Sujeet Kumar', constituency: 'Odisha' },
  { area: 'Test', category: 'Roads', notice: 'Test notice text', mp_name: 'Nitin Gadkari', constituency: 'Central Delhi' },
  { area: 'Test', category: 'Roads', notice: 'Test notice text', mp_name: 'Sujeet Kumar', constituency: 'Central Delhi' },
  { area: 'Test', category: 'Roads', notice: 'Test notice text', mp_name: 'Test MP', constituency: 'Central Delhi' },
  { area: 'Test', category: 'Roads', notice: 'Test notice text', mp_name: '', constituency: '' },
  { area: 'Test', category: 'Roads', notice: 'Test notice text' }
];

async function runTests() {
  for (let i = 0; i < combinations.length; i++) {
    const payload = combinations[i];
    console.log(`\nTest #${i + 1} with payload:`, JSON.stringify(payload));
    const { data, error } = await supabase.from('mp_notices').insert(payload).select();
    if (error) {
      console.log(`Failed: ${error.code} - ${error.message}`);
    } else {
      console.log("SUCCESS!", data);
      // Delete the inserted notice to clean up
      const idVal = data[0].id || data[0].notice_id;
      const idKey = data[0].id ? 'id' : 'notice_id';
      await supabase.from('mp_notices').delete().eq(idKey, idVal);
      console.log("Cleaned up.");
    }
  }
}

runTests();
