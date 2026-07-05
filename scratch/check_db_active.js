import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ynywdcpumwhrqzlddhte.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlueXdkY3B1bXdocnF6bGRkaHRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5OTkyNTEsImV4cCI6MjA5ODU3NTI1MX0.r-f8A89H89pQLH0yUWf-eC3JUntJLFm_zKoJ2FqWaSQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data, error } = await supabase.from('issues').select('*').limit(1);
  if (error) {
    console.error("Error fetching:", error);
  } else if (data && data.length > 0) {
    console.log("Columns present in active issues table:", Object.keys(data[0]));
    console.log("First record:", data[0]);
  } else {
    console.log("No records found in active database issues table.");
  }
}

check();
