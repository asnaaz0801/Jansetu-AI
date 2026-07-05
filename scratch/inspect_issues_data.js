import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jkczxfgogacjhpkygvns.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprY3p4ZmdvZ2Fjamhwa3lndm5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NDUyMDUsImV4cCI6MjA5ODEyMTIwNX0.31dBZ2Z67eLyXR4hCUPV_8-UDOS9iQIVnxOGU14Bh3Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectData() {
  const { data, error } = await supabase.from('issues').select('area, category').limit(100);
  if (error) {
    console.error("Error fetching issues:", error);
    return;
  }
  const areas = [...new Set(data.map(i => i.area).filter(Boolean))];
  const categories = [...new Set(data.map(i => i.category).filter(Boolean))];
  console.log("Distinct Areas in issues table:", areas);
  console.log("Distinct Categories in issues table:", categories);
}

inspectData();
