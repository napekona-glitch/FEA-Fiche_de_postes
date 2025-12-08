const fs = require('fs');

// Read the current broken index.html
let content = fs.readFileSync('./index.html', 'utf8');

console.log('Fixing HTML structure...');

// Fix the broken structure by adding missing closing tags
content = content.replace(
    /(<li><a href="[^"]+">[^<]+<\/a><\/li>\s*)(<h3>)/g,
    '$1</ul></div>\n                    <div class="index-section">\n                        $2'
);

content = content.replace(
    /(<\/li>\s*)(<h3>)/g,
    '$1</ul>\n                    </div>\n                    <div class="index-section">\n                        <h3>'
);

content = content.replace(
    /(<li><a href="[^"]+">[^<]+<\/a><\/li>\s*)(<\/div>)/g,
    '$1</ul>\n                    </div>\n                $2'
);

// Fix the end of the sections
content = content.replace(
    /(<li><a href="[^"]+">[^<]+<\/a><\/li>\s*)(<\/div>\s*<\/div>\s*<\/section>)/g,
    '$1</ul>\n                    </div>\n                $2'
);

// Ensure proper container closing
content = content.replace(
    /(<\/section>)/g,
    '$1\n            </div>'
);

// Fix footer structure
content = content.replace(
    /(<footer class="footer">\s*)(<p>)/g,
    '$1<div class="container">\n                $2'
);

content = content.replace(
    /(<\/p>)(\s*<\/footer>)/g,
    '$1\n            </div>\n    $2'
);

fs.writeFileSync('./index.html', content);
console.log('Fixed HTML structure');
