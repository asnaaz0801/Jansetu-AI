async function testGeocode(lat, lng, name) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
  console.log(`\n--- Fetching for ${name} (${lat}, ${lng}) ---`);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Jansetu-AI-Constituency-Planner-App'
      }
    });
    const data = await res.json();
    console.log("Address:", JSON.stringify(data.address, null, 2));
  } catch (err) {
    console.error(`Geocoding failed for ${name}:`, err);
  }
}

async function run() {
  await testGeocode(19.0760, 72.8777, "Mumbai");
  await testGeocode(12.9716, 77.5946, "Bangalore");
  await testGeocode(25.3176, 82.9739, "Varanasi (Rural/Semi-urban)");
  await testGeocode(26.8467, 80.9462, "Lucknow");
}

run();
