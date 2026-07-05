import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ynywdcpumwhrqzlddhte.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlueXdkY3B1bXdocnF6bGRkaHRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5OTkyNTEsImV4cCI6MjA5ODU3NTI1MX0.r-f8A89H89pQLH0yUWf-eC3JUntJLFm_zKoJ2FqWaSQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixDbCodes() {
  const { data, error } = await supabase
    .from('issues')
    .select('issue_id, reference_code, title')
    .eq('reference_code', 'JSA-2026-2026')
    .order('created_at', { ascending: true });

  if (error) {
    console.error("Error fetching:", error);
    return;
  }

  console.log("Found duplicate JSA-2026-2026 rows:", data);

  // Update them to 0016, 0017 etc.
  let nextSuffix = 16;
  for (const row of data) {
    const newCode = `JSA-2026-${String(nextSuffix).padStart(4, '0')}`;
    console.log(`Updating ${row.issue_id} (${row.title}) -> ${newCode}`);
    const { error: updErr } = await supabase
      .from('issues')
      .update({ reference_code: newCode })
      .eq('issue_id', row.issue_id);

    if (updErr) {
      console.error("Update failed:", updErr);
    } else {
      console.log("Update succeeded!");
    }
    nextSuffix++;
  }
}

fixDbCodes();
