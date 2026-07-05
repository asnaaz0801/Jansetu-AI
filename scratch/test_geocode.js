async function testGeocode() {
  const lat = 28.6139;
  const lng = 77.2090;
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
  console.log(`Fetching from: ${url}`);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Jansetu-AI-Constituency-Planner-App'
      }
    });
    const data = await res.json();
    console.log("Geocoding result:\n", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Geocoding failed:", err);
  }
}

testGeocode();
