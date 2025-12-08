const fs = require('fs');
const path = require('path');

// Dossier contenant les fichiers HTML
const htmlDir = __dirname;

// Fonction pour mettre à jour un fichier HTML
function updateHTMLFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Vérifier si le chatbot est déjà intégré
        if (content.includes('chatbot.css') && content.includes('chatbot.js')) {
            console.log(`Le fichier ${path.basename(filePath)} a déjà été mis à jour.`);
            return;
        }
        
        // Ajouter le lien vers le CSS du chatbot
        if (content.includes('<link rel="stylesheet" href="CSS/style.css">')) {
            content = content.replace(
                '<link rel="stylesheet" href="CSS/style.css">',
                '<link rel="stylesheet" href="CSS/style.css">\n    <link rel="stylesheet" href="CSS/chatbot.css">'
            );
        }
        
        // Ajouter le script du chatbot avant la fermeture du body
        if (content.includes('</body>')) {
            content = content.replace(
                '</body>',
                '    <script src="JS/chatbot.js"></script>\n</body>'
            );
        }
        
        // Écrire les modifications dans le fichier
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fichier ${path.basename(filePath)} mis à jour avec succès.`);
        
    } catch (error) {
        console.error(`Erreur lors de la mise à jour du fichier ${filePath}:`, error);
    }
}

// Fonction principale
function main() {
    // Lire tous les fichiers HTML du répertoire
    fs.readdir(htmlDir, (err, files) => {
        if (err) {
            console.error('Erreur lors de la lecture du répertoire:', err);
            return;
        }
        
        // Filtrer les fichiers HTML
        const htmlFiles = files.filter(file => file.endsWith('.html') && file !== 'index.html');
        
        console.log(`Mise à jour de ${htmlFiles.length} fichiers HTML...`);
        
        // Mettre à jour chaque fichier HTML
        htmlFiles.forEach(file => {
            const filePath = path.join(htmlDir, file);
            updateHTMLFile(filePath);
        });
        
        console.log('Mise à jour terminée !');
    });
}

// Exécuter le script
main();
