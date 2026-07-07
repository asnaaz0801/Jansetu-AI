const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/lib/translations.js');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Rename step4Question to step3Question globally
content = content.replace(/step4Question:/g, 'step3Question:');

// 2. Add step4Helper to all languages
const helperTranslations = {
  en: "Automatically determined based on estimated public impact.",
  hi: "अनुमानित सार्वजनिक प्रभाव के आधार पर स्वचालित रूप से निर्धारित।",
  mr: "अंदाजित सार्वजनिक प्रभावाच्या आधारे स्वयंचलितपणे निर्धारित.",
};

const lines = content.split('\n');
let currentLang = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const langMatch = line.match(/^\s*(\w+):\s*\{/);
  if (langMatch) {
    currentLang = langMatch[1];
  }
  
  // Swap step3Title and step4Title if we find them
  if (line.includes('step3Title:') && lines[i+1] && lines[i+1].includes('step4Title:')) {
    const line3 = line;
    const line4 = lines[i+1];
    
    const val3Match = line3.match(/step3Title:\s*"(.*?)"\s*,(.*)/);
    const val4Match = line4.match(/step4Title:\s*"(.*?)"\s*,(.*)/);
    
    if (val3Match && val4Match) {
      const val3 = val3Match[1];
      const val4 = val4Match[1];
      const rest3 = val3Match[2];
      const rest4 = val4Match[2];
      
      const parts3 = val3.split(':');
      const prefix3 = parts3[0];
      const suffix3 = parts3.slice(1).join(':');
      
      const parts4 = val4.split(':');
      const prefix4 = parts4[0];
      const suffix4 = parts4.slice(1).join(':');
      
      const newVal3 = prefix3 + ':' + suffix4;
      const newVal4 = prefix4 + ':' + suffix3;
      
      const indent3 = line3.match(/^\s*/)[0];
      const indent4 = line4.match(/^\s*/)[0];
      
      lines[i] = `${indent3}step3Title: "${newVal3}",${rest3}`;
      lines[i+1] = `${indent4}step4Title: "${newVal4}",${rest4}`;
    }
  }
  
  if (line.includes('step3Question:')) {
    const helperText = helperTranslations[currentLang] || helperTranslations['en'];
    const indent = line.match(/^\s*/)[0];
    const lineEnding = line.endsWith('\r') ? '\r' : '';
    lines[i] = line + `\n${indent}step4Helper: "${helperText}",${lineEnding}`;
  }
}

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log('Successfully updated translations!');
