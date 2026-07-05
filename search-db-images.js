import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jkczxfgogacjhpkygvns.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprY3p4ZmdvZ2Fjamhwa3lndm5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NDUyMDUsImV4cCI6MjA5ODEyMTIwNX0.31dBZ2Z67eLyXR4hCUPV_8-UDOS9iQIVnxOGU14Bh3Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function findUrls() {
  const { data, error } = await supabase.from('issues').select('*');
  if (error) {
    console.error(error);
    return;
  }
  console.log(`Fetched ${data.length} rows.`);
  let found = false;
  for (const row of data) {
    for (const [key, val] of Object.entries(row)) {
      if (typeof val === 'string' && (val.includes('http') || val.includes('.jpg') || val.includes('.png') || val.includes('.jpeg'))) {
        console.log(`Found in Row ${row.reference_code || row.issue_id}, Column ${key}:`, val);
        found = true;
      }
    }
  }
  if (!found) {
    console.log("No URL or image strings found in any column of any row.");
  }
}

findUrls();
