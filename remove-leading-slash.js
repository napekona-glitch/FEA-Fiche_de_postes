const fs = require('fs');

// Read index.html
let content = fs.readFileSync('./index.html', 'utf8');

console.log('Removing leading slashes from href attributes...');

// Remove leading slash from all href attributes that point to HTML files
content = content.replace(/href="\/([^"]+\.html)"/g, 'href="$1"');

// Also fix the CSS and JS links to use relative paths
content = content.replace(/href="\/(CSS\/[^"]+)"/g, 'href="$1"');
content = content.replace(/src="\/(JS\/[^"]+)"/g, 'src="$1"');

fs.writeFileSync('./index.html', content);
console.log('Removed leading slashes from href attributes');
