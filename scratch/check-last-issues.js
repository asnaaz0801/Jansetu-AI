import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ynywdcpumwhrqzlddhte.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlueXdkY3B1bXdocnF6bGRkaHRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5OTkyNTEsImV4cCI6MjA5ODU3NTI1MX0.r-f8A89H89pQLH0yUWf-eC3JUntJLFm_zKoJ2FqWaSQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkIssues() {
  const { data, error } = await supabase
    .from('issues')
    .select('issue_id, reference_code, citizen_id, title, category, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error("Error fetching issues:", error);
  } else {
    console.log("Latest issues in DB:");
    data.forEach((row, i) => {
      console.log(`[${i}] issue_id: ${row.issue_id}, reference_code: ${row.reference_code}, title: "${row.title}", category: "${row.category}", created_at: ${row.created_at}`);
    });
  }
}

checkIssues();
