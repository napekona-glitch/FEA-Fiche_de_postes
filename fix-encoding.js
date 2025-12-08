const fs = require('fs');
const path = require('path');

// Get all HTML files
const htmlDir = '.';
const htmlFiles = fs.readdirSync(htmlDir).filter(file => file.endsWith('.html'));

console.log('Adding UTF-8 encoding meta tags to all HTML files...');

htmlFiles.forEach(file => {
    const filePath = path.join(htmlDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if Content-Type meta tag already exists
    if (!content.includes('<meta http-equiv="Content-Type"')) {
        // Add Content-Type meta tag after charset meta tag
        content = content.replace(
            /(<meta charset="UTF-8">)/,
            '$1\n    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">'
        );
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${file}`);
    } else {
        console.log(`Already has encoding meta tag: ${file}`);
    }
});

console.log('Done!');
