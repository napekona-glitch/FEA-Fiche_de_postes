# Script pour ajouter le chatbot à toutes les fiches HTML
$chatbotCssLink = '<link rel="stylesheet" href="CSS/chatbot.css">'
$chatbotHtml = @"
    <!-- Chatbot -->
    <div id="chatbot-container" class="minimized">
        <div class="chatbot-header">
            <div class="header-content">
                <div class="chatbot-avatar">
                    <img src="https://img.icons8.com/color/96/000000/chatbot.png" alt="Chatbot">
                </div>
                <div class="chatbot-info">
                    <h3>Assistant FEA</h3>
                    <p>En ligne</p>
                </div>
            </div>
            <button id="minimize-chat" class="icon-btn">−</button>
            <button id="close-chat" class="icon-btn">×</button>
        </div>
        
        <div class="chatbot-messages">
            <div class="welcome-message">
                <p>👋 Bonjour ! Je suis votre assistant virtuel. Comment puis-je vous aider aujourd'hui ?</p>
                <p>Vous pouvez me poser des questions sur les fiches de poste, les compétences requises ou tout autre sujet lié à la filière architecture.</p>
            </div>
        </div>
        
        <div class="chatbot-input">
            <input type="text" id="user-input" placeholder="Décrivez votre problématique ou votre projet...">
            <button id="send-message">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        </div>
    </div>
    
    <script src="JS/chatbot.js"></script>
"@

# Liste de tous les fichiers HTML (sauf index.html)
$htmlFiles = Get-ChildItem -Path . -Filter "*.html" -Exclude "index.html"

foreach ($file in $htmlFiles) {
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    
    # Vérifier si le chatbot est déjà présent
    if ($content -notmatch 'id="chatbot-container"') {
        # Ajouter le lien CSS dans le head
        $content = $content -replace '(?<=\s*<link[^>]*>\s*<\/head>)', "`n    $chatbotCssLink`n"
        
        # Ajouter le HTML du chatbot avant la fermeture du body
        $content = $content -replace '(?<=\s*<\/footer>[\s\r\n]*<\/body>)', "`n$chatbotHtml"
        
        # Écrire les modifications dans le fichier
        $content | Set-Content -Path $file.FullName -NoNewline -Encoding UTF8
        Write-Host "✅ Mise à jour de $($file.Name) terminée"
    } else {
        Write-Host "ℹ️ $($file.Name) a déjà le chatbot, ignoré"
    }
}

Write-Host "✅ Toutes les fiches ont été mises à jour avec succès !"
Read-Host "Appuyez sur Entrée pour continuer..."
