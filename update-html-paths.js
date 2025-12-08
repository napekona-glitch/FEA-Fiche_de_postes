const fs = require('fs');
const path = require('path');

// Get all HTML files
const htmlDir = '.';
const htmlFiles = fs.readdirSync(htmlDir).filter(file => file.endsWith('.html'));

console.log('Updating paths in HTML files...');

htmlFiles.forEach(file => {
    const filePath = path.join(htmlDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Update CSS paths to absolute
    content = content.replace(/href="CSS\//g, 'href="/CSS/');
    content = content.replace(/href="JS\//g, 'href="/JS/');
    
    // Update JS script paths to absolute
    content = content.replace(/src="JS\//g, 'src="/JS/');
    
    // Update image paths to absolute
    content = content.replace(/src="wekey-image\.png"/g, 'src="/wekey-image.png');
    
    // Update other asset paths
    content = content.replace(/src="[^"]*\.png"/g, (match) => {
        if (!match.startsWith('/')) {
            return match.replace('src="', 'src="/');
        }
        return match;
    });
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${file}`);
});

console.log('Done!');
