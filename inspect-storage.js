import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jkczxfgogacjhpkygvns.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprY3p4ZmdvZ2Fjamhwa3lndm5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NDUyMDUsImV4cCI6MjA5ODEyMTIwNX0.31dBZ2Z67eLyXR4hCUPV_8-UDOS9iQIVnxOGU14Bh3Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectStorage() {
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) {
    console.error("Error listing buckets:", error.message);
  } else {
    console.log("Buckets:", buckets);
    for (const bucket of buckets) {
      const { data: files, error: filesErr } = await supabase.storage.from(bucket.id).list();
      if (filesErr) {
        console.error(`Error listing files in bucket ${bucket.id}:`, filesErr.message);
      } else {
        console.log(`Files in bucket ${bucket.id}:`, files);
      }
    }
  }
}

inspectStorage();
