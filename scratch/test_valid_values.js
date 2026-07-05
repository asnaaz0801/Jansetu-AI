import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jkczxfgogacjhpkygvns.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprY3p4ZmdvZ2Fjamhwa3lndm5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NDUyMDUsImV4cCI6MjA5ODEyMTIwNX0.31dBZ2Z67eLyXR4hCUPV_8-UDOS9iQIVnxOGU14Bh3Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
  const dummy = {
    area: 'Jafarnagar',
    category: 'Roads',
    notice: 'Official notice regarding Jafarnagar road reconstruction.',
    mp_name: 'Nitin Gadkari',
    constituency: 'Nagpur'
  };

  console.log("Inserting notice with valid area and category...");
  const { data, error } = await supabase.from('mp_notices').insert(dummy).select();
  if (error) {
    console.error("Insert error:", error);
  } else {
    console.log("SUCCESS!", data);
    // clean up
    const idKey = data[0].id ? 'id' : 'notice_id';
    const idVal = data[0].id || data[0].notice_id;
    await supabase.from('mp_notices').delete().eq(idKey, idVal);
    console.log("Clean up done.");
  }
}

testInsert();
