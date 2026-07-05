import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jkczxfgogacjhpkygvns.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprY3p4ZmdvZ2Fjamhwa3lndm5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NDUyMDUsImV4cCI6MjA5ODEyMTIwNX0.31dBZ2Z67eLyXR4hCUPV_8-UDOS9iQIVnxOGU14Bh3Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspect() {
  console.log("--- mp_notices structure ---");
  const { data: noticeData, error: noticeErr } = await supabase.from('mp_notices').select('*').limit(1);
  if (noticeErr) {
    console.error("Error fetching mp_notices:", noticeErr);
  } else {
    console.log("mp_notices row:", noticeData);
  }

  console.log("--- issues structure ---");
  const { data: issueData, error: issueErr } = await supabase.from('issues').select('*').limit(1);
  if (issueErr) {
    console.error("Error fetching issues:", issueErr);
  } else {
    console.log("issues row keys:", issueData && issueData.length > 0 ? Object.keys(issueData[0]) : "No issues found");
  }
}

inspect();
