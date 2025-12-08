# --------------------------------------------------------------
# clean-french-rewrite.ps1
# Nettoie le texte de tous les fichiers *.html* du répertoire Fiche_de_postes,
# supprime les caractères non-français et reformule les phrases en français correct
# en utilisant l'API Groq (GRATUIT). Une sauvegarde *.bak* est créée avant toute modification.
# --------------------------------------------------------------

# ----- Configuration -----
$basePath = "C:\Users\NapéKONA\Documents\filiere_Architecture\Fiche_de_postes"

# Vous devez définir votre clé API Groq dans la variable d'environnement GROQ_API_KEY
# Exemple : $env:GROQ_API_KEY = "gsk_..."
if (-not $env:GROQ_API_KEY) {
    Write-Error "Variable d'environnement GROQ_API_KEY non définie. Veuillez la définir avant d'exécuter le script."
    exit 1
}

# Modèle Groq à utiliser (GRATUIT et ultra-rapide !)
$model = "mixtral-8x7b-32768"

# Expression régulière qui garde les caractères français (lettres accentuées, chiffres, ponctuation standard)
$allowedPattern = '[^a-zA-Z0-9éèêëàâäïîöôùûüçœæÉÈÊËÀÂÄÏÎÖÔÙÛÜÇŒÆ.,;:!?''""\-\s\r\n]'

function Invoke-GroqRewrite {
    param(
        [string]$text
    )
    
    $prompt = @"
Réécris le texte suivant en français correct, en conservant le sens, la ponctuation et le style professionnel. Supprime tout caractère spécial qui ne fait pas partie de l'alphabet français (emoji, symboles, etc.).

Texte à reformuler :
$text
"@

    $body = @{
        model       = $model
        messages    = @(
            @{ role = 'system'; content = 'Tu es un assistant qui reformule du texte en français impeccable.' },
            @{ role = 'user'; content = $prompt }
        )
        temperature = 0.2
    } | ConvertTo-Json -Depth 5

    try {
        $response = Invoke-RestMethod -Method Post -Uri "https://api.groq.com/openai/v1/chat/completions" `
            -Headers @{ 
            Authorization  = "Bearer $env:GROQ_API_KEY"
            "Content-Type" = "application/json" 
        } `
            -Body $body

        return $response.choices[0].message.content.Trim()
    }
    catch {
        Write-Error "Erreur lors de l'appel à l'API Groq : $_"
        return $text
    }
}

function CleanAndRewrite-File {
    param([string]$filePath)
    
    Write-Host "🔧 Traitement de $filePath"
    
    # Sauvegarde du fichier original
    Copy-Item -Path $filePath -Destination "$filePath.bak" -Force
    
    $originalContent = Get-Content -Path $filePath -Raw -Encoding UTF8

    # Séparer le texte du HTML en conservant les balises comme placeholders
    $tags = @()
    $placeholder = "___TAGPLACEHOLDER___"
    $contentWithPlaceholders = $originalContent -replace '<[^>]+>', {
        $tags += $_.Value
        $placeholder
    }

    # Nettoyage des caractères non-français
    $cleanText = $contentWithPlaceholders -replace $allowedPattern, ''
    $cleanText = $cleanText -replace '\s+', ' '
    $cleanText = $cleanText.Trim()

    # Reformulation via Groq (on envoie le texte complet pour garder le contexte)
    Write-Host "   📡 Envoi à Groq pour reformulation..."
    $rewritten = Invoke-GroqRewrite -text $cleanText

    # Ré-insertion des balises aux mêmes positions
    $finalContent = $rewritten
    foreach ($tag in $tags) {
        $finalContent = $finalContent -replace [regex]::Escape($placeholder), $tag, 1
    }

    # Écriture du fichier nettoyé et reformulé
    Set-Content -Path $filePath -Value $finalContent -Encoding UTF8
    Write-Host "   ✅ Fichier nettoyé, reformulé et sauvegarde .bak créée`n"
}

# Parcours de tous les fichiers *.html* et *.htm*
Write-Host "`n🚀 Démarrage du nettoyage et de la reformulation...`n"

$files = Get-ChildItem -Path $basePath -Recurse -Include *.html, *.htm
$totalFiles = $files.Count
$currentFile = 0

foreach ($file in $files) {
    $currentFile++
    Write-Host "[$currentFile/$totalFiles]"
    CleanAndRewrite-File -filePath $file.FullName
}

Write-Host "`n🎉 Nettoyage, reformulation et sauvegarde terminés !"
Write-Host "   📊 $totalFiles fichiers traités"
Write-Host "   💾 Les fichiers originaux sont sauvegardés avec l'extension .bak"
