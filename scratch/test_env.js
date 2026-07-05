console.log("Checking system environment variables...");
const keys = Object.keys(process.env).filter(k => 
  k.includes("GEMINI") || 
  k.includes("KEY") || 
  k.includes("API") || 
  k.includes("VITE")
);
console.log("Matching env keys:", keys);
keys.forEach(k => {
  if (k.includes("GEMINI")) {
    console.log(`${k}: (exists, length=${process.env[k]?.length})`);
  }
});
