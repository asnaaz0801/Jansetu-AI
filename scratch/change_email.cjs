const fs = require('fs');
const path = require('path');

const transPath = path.join(__dirname, '../src/lib/translations.js');
let transContent = fs.readFileSync(transPath, 'utf8');

const supportPath = path.join(__dirname, '../src/pages/HelpSupport.jsx');
let supportContent = fs.readFileSync(supportPath, 'utf8');

// Replace in translations.js
const updatedTrans = transContent.replace(/support@jansetu\.ai/g, 'jansetusupportteam@gmail.com');
fs.writeFileSync(transPath, updatedTrans, 'utf8');
console.log('Updated translations.js');

// Replace in HelpSupport.jsx
const updatedSupport = supportContent.replace(/support@jansetu\.ai/g, 'jansetusupportteam@gmail.com');
fs.writeFileSync(supportPath, updatedSupport, 'utf8');
console.log('Updated HelpSupport.jsx');
