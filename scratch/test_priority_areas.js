import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jkczxfgogacjhpkygvns.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprY3p4ZmdvZ2Fjamhwa3lndm5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NDUyMDUsImV4cCI6MjA5ODEyMTIwNX0.31dBZ2Z67eLyXR4hCUPV_8-UDOS9iQIVnxOGU14Bh3Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data: issues } = await supabase.from('issues').select('*');
  console.log("Total issues fetched:", issues.length);

  const areaMetrics = {};
  issues.forEach(c => {
    const areaName = c.area || c.city || 'Constituency Central';
    if (!areaMetrics[areaName]) {
      areaMetrics[areaName] = {
        name: areaName,
        count: 0
      };
    }
    areaMetrics[areaName].count += 1;
  });

  console.log("Area Metrics:", areaMetrics);
}

run();
