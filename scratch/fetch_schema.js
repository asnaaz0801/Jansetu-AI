import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ynywdcpumwhrqzlddhte.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlueXdkY3B1bXdocnF6bGRkaHRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5OTkyNTEsImV4cCI6MjA5ODEyMTIwNX0.r-f8A89H89pQLH0yUWf-eC3JUntJLFm_zKoJ2FqWaSQ';

async function fetchSchema() {
  console.log("Fetching schema...");
  const res = await fetch(`${supabaseUrl}/rest/v1/`, {
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`
    }
  });
  if (!res.ok) {
    console.error("Failed to fetch schema:", res.statusText);
    return;
  }
  const schema = await res.json();
  if (schema.definitions && schema.definitions.issues) {
    console.log("issues table definition:", JSON.stringify(schema.definitions.issues, null, 2));
  } else {
    console.log("issues definition not found in schema");
  }
}

fetchSchema();
