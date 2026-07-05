import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jkczxfgogacjhpkygvns.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprY3p4ZmdvZ2Fjamhwa3lndm5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NDUyMDUsImV4cCI6MjA5ODEyMTIwNX0.31dBZ2Z67eLyXR4hCUPV_8-UDOS9iQIVnxOGU14Bh3Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runTest() {
  const noticeArea = 'kalamna';
  const noticeCategory = 'Water Supply';
  const noticeStatus = 'In Progress';
  const noticeText = 'Test Notice Content';
  const mpName = 'Test MP';
  const mpConstituency = 'Test Constituency';

  console.log("--- 1. Testing Notice Insert with status ---");
  const { data: insData, error: insErr } = await supabase
    .from('mp_notices')
    .insert({
      area: noticeArea,
      category: noticeCategory,
      status: noticeStatus,
      notice: noticeText,
      mp_name: mpName,
      constituency: mpConstituency,
      created_at: new Date().toISOString()
    })
    .select();

  console.log("Insert response:", { insData, insErr });

  console.log("--- 2. Testing Issues Update ---");
  const { data: updData, error: updErr } = await supabase
    .from('issues')
    .update({ status: noticeStatus })
    .eq('area', noticeArea)
    .eq('category', noticeCategory)
    .select();

  console.log("Update response:", { updData, updErr });
}

runTest();
