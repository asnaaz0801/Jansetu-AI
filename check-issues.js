import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ynywdcpumwhrqzlddhte.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlueXdkY3B1bXdocnF6bGRkaHRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5OTkyNTEsImV4cCI6MjA5ODU3NTI1MX0.r-f8A89H89pQLH0yUWf-eC3JUntJLFm_zKoJ2FqWaSQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listLocations() {
  const { data, error } = await supabase
    .from('issues')
    .select('reference_code, title, latitude, longitude, area, city, state, constituency');

  if (error) {
    console.error("Error fetching:", error);
  } else {
    console.log("Locations in DB:");
    data.forEach(d => {
      console.log(`Code: ${d.reference_code} | Title: ${d.title} | Lat: ${d.latitude} | Lng: ${d.longitude} | Area: ${d.area} | City: ${d.city} | State: ${d.state} | Const: ${d.constituency}`);
    });
  }
}

listLocations();
