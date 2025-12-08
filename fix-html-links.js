const fs = require('fs');
const path = require('path');

// Read index.html
const filePath = './index.html';
let content = fs.readFileSync(filePath, 'utf8');

console.log('Fixing HTML links in index.html...');

// Replace all HTML file links with absolute paths
content = content.replace(/href="([^"]+\.html)"/g, 'href="/$1"');

// Remove duplicate lines that might have been created
const lines = content.split('\n');
const uniqueLines = [];
const seen = new Set();

lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !seen.has(trimmed)) {
        uniqueLines.push(line);
        seen.add(trimmed);
    } else if (!trimmed) {
        uniqueLines.push(line); // Keep empty lines
    }
});

content = uniqueLines.join('\n');

fs.writeFileSync(filePath, content);
console.log('Fixed index.html');
