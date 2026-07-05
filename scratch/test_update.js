import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jkczxfgogacjhpkygvns.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprY3p4ZmdvZ2Fjamhwa3lndm5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NDUyMDUsImV4cCI6MjA5ODEyMTIwNX0.31dBZ2Z67eLyXR4hCUPV_8-UDOS9iQIVnxOGU14Bh3Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testUpdate() {
  const area = 'kalamna';
  const category = 'Roads';
  const newStatus = 'In Progress';

  console.log(`Matching complaints for area: ${area}, category: ${category}`);
  const { data: matched, error: matchErr } = await supabase
    .from('issues')
    .select('*')
    .eq('area', area)
    .eq('category', category);
  
  if (matchErr) {
    console.error("Match error:", matchErr);
    return;
  }
  console.log("Matched rows count:", matched.length);
  console.log("Matched rows:", matched);

  console.log("Performing update...");
  const { data: updated, error: updateErr } = await supabase
    .from('issues')
    .update({ status: newStatus })
    .eq('area', area)
    .eq('category', category)
    .select();

  if (updateErr) {
    console.error("Update error:", updateErr);
  } else {
    console.log("Updated rows count:", updated.length);
    console.log("Updated rows:", updated);
  }
}

testUpdate();
