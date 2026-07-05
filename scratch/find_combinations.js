import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jkczxfgogacjhpkygvns.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprY3p4ZmdvZ2Fjamhwa3lndm5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NDUyMDUsImV4cCI6MjA5ODEyMTIwNX0.31dBZ2Z67eLyXR4hCUPV_8-UDOS9iQIVnxOGU14Bh3Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function findCombinations() {
  const { data, error } = await supabase.from('issues').select('area, category, status');
  if (error) {
    console.error(error);
    return;
  }
  console.log("All issues in DB:");
  data.forEach((row, i) => {
    console.log(`${i+1}: area="${row.area}", category="${row.category}", status="${row.status}"`);
  });
}

findCombinations();
