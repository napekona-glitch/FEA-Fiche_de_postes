const fs = require('fs');
const path = require('path');

// Get all HTML files
const htmlDir = '.';
const htmlFiles = fs.readdirSync(htmlDir).filter(file => file.endsWith('.html'));

// Generate a timestamp for cache busting
const timestamp = Date.now();

console.log(`Adding cache-buster (${timestamp}) to CSS and JS files...`);

htmlFiles.forEach(file => {
    const filePath = path.join(htmlDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add cache-buster to CSS files
    content = content.replace(/href="\/(CSS\/[^"]+\.css)"/g, `href="/$1?v=${timestamp}"`);
    
    // Add cache-buster to JS files
    content = content.replace(/src="\/(JS\/[^"]+\.js)"/g, `src="/$1?v=${timestamp}"`);
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${file}`);
});

console.log('Done!');
