import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jkczxfgogacjhpkygvns.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprY3p4ZmdvZ2Fjamhwa3lndm5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NDUyMDUsImV4cCI6MjA5ODEyMTIwNX0.31dBZ2Z67eLyXR4hCUPV_8-UDOS9iQIVnxOGU14Bh3Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSignUpAndInsert() {
  console.log("Signing up asnaaz.0801@gmail.com...");
  const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
    email: 'asnaaz.0801@gmail.com',
    password: 'Mp2@12345'
  });

  if (signUpErr) {
    console.error("Sign up failed:", signUpErr);
    return;
  }

  console.log("Sign up successful/attempted. User:", signUpData.user?.email, "Session:", signUpData.session ? "Active" : "None/Pending");

  // If session is active or we can use the signed-in client, try inserting
  const dummy = {
    area: 'Test Area',
    category: 'Roads',
    notice: 'Test Notice Text',
    mp_name: 'Nitin Gadkari',
    constituency: 'Nagpur'
  };

  console.log("Inserting dummy notice...");
  const { data, error } = await supabase.from('mp_notices').insert(dummy).select();
  if (error) {
    console.error("Insert error:", error);
  } else {
    console.log("SUCCESS! Inserted notice row keys (columns):", Object.keys(data[0]));
    console.log("Inserted notice content:", data[0]);

    // Clean up
    const idField = data[0].id ? 'id' : (data[0].notice_id ? 'notice_id' : null);
    if (idField) {
      console.log(`Cleaning up dummy notice using ${idField} = ${data[0][idField]}...`);
      const { error: delErr } = await supabase.from('mp_notices').delete().eq(idField, data[0][idField]);
      if (delErr) {
        console.error("Delete error:", delErr);
      } else {
        console.log("Clean up successful.");
      }
    }
  }
}

testSignUpAndInsert();
