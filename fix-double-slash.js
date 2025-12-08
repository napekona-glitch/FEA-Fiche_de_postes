const fs = require('fs');
const path = require('path');

// Read index.html
const filePath = './index.html';
let content = fs.readFileSync(filePath, 'utf8');

console.log('Fixing double slash URLs in index.html...');

// Replace // with / for HTML file links
content = content.replace(/href="\/\/([^"]+\.html)"/g, 'href="/$1"');

fs.writeFileSync(filePath, content);
console.log('Fixed double slash URLs in index.html');
