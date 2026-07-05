import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jkczxfgogacjhpkygvns.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprY3p4ZmdvZ2Fjamhwa3lndm5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NDUyMDUsImV4cCI6MjA5ODEyMTIwNX0.31dBZ2Z67eLyXR4hCUPV_8-UDOS9iQIVnxOGU14Bh3Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const columnsToTest = [
  'email',
  'mp_email',
  'user_id',
  'mp_id',
  'id',
  'notice_id',
  'status',
  'title',
  'description',
  'created_at'
];

async function runTests() {
  console.log("Checking columns on mp_notices table...");
  for (const col of columnsToTest) {
    const payload = {
      area: 'Test',
      category: 'Roads',
      notice: 'Test notice text',
      mp_name: 'Nitin Gadkari',
      constituency: 'Nagpur',
      [col]: col === 'id' || col === 'mp_id' || col === 'user_id' ? '68758794-f6e0-4e59-b3bf-b4fc654d092d' : (col === 'email' || col === 'mp_email' ? 'asnaaz.0801@gmail.com' : 'Test')
    };

    const { error } = await supabase.from('mp_notices').insert(payload).select();
    if (error) {
      if (error.code === '42703') {
        console.log(`Column '${col}': DOES NOT EXIST`);
      } else {
        console.log(`Column '${col}': EXISTS (Failed with other error: ${error.code} - ${error.message})`);
      }
    } else {
      console.log(`Column '${col}': EXISTS (Insert succeeded!)`);
    }
  }
}

runTests();
