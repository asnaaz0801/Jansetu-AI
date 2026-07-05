import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ynywdcpumwhrqzlddhte.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlueXdkY3B1bXdocnF6bGRkaHRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5OTkyNTEsImV4cCI6MjA5ODU3NTI1MX0.r-f8A89H89pQLH0yUWf-eC3JUntJLFm_zKoJ2FqWaSQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectColumnsDefault() {
  // Let's try to query information_schema via standard query (PostgREST does not expose information_schema by default, but let's check)
  const { data, error } = await supabase
    .from('issues')
    .select('reference_code')
    .limit(1);
    
  console.log("Error:", error);
  console.log("Data:", data);
}

inspectColumnsDefault();
