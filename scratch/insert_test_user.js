import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jkczxfgogacjhpkygvns.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprY3p4ZmdvZ2Fjamhwa3lndm5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NDUyMDUsImV4cCI6MjA5ODEyMTIwNX0.31dBZ2Z67eLyXR4hCUPV_8-UDOS9iQIVnxOGU14Bh3Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function insertUser() {
  console.log("Inserting test user into mp_users...");
  const payload = {
    name: 'Hon. Rajesh Kumar',
    email: 'rajesh.kumar@sansad.nic.in',
    password: 'password123',
    constituency: 'Central Delhi'
  };

  const { data, error } = await supabase.from('mp_users').insert(payload).select();
  if (error) {
    console.error("Error inserting user:", error);
  } else {
    console.log("Inserted user successfully:", data);
  }
}

insertUser();
