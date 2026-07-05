import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ynywdcpumwhrqzlddhte.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlueXdkY3B1bXdocnF6bGRkaHRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5OTkyNTEsImV4cCI6MjA5ODU3NTI1MX0.r-f8A89H89pQLH0yUWf-eC3JUntJLFm_zKoJ2FqWaSQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
  const payload = {
    citizen_id: '00000000-0000-0000-0000-000000000001',
    title: 'Test insert with email_id',
    description: 'This is a test description of at least thirty characters long.',
    category: 'Roads',
    constituency: 'Central Delhi',
    state: 'Delhi',
    latitude: 28.6139,
    longitude: 77.2090,
    status: 'Pending',
    email_id: 'test@example.com'
  };

  const { data, error } = await supabase.from('issues').insert(payload).select();
  if (error) {
    console.error("Insert failed:", error);
  } else {
    console.log("Insert succeeded! Result:", data);
  }
}

testInsert();
