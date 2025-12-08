# Sauvegarder les fichiers avant modification
$backupDir = ".\backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
New-Item -ItemType Directory -Path $backupDir -Force
Copy-Item -Path "*.html" -Destination $backupDir -Recurse -Force

# Fonction pour nettoyer le contenu
function Clean-HtmlContent {
    param([string]$content)
    
    # Remplacer les séquences problématiques
    $content = $content -replace 'é', 'é'
    $content = $content -replace 'è', 'è'
    $content = $content -replace 'ê', 'ê'
    $content = $content -replace 'ë', 'ë'
    $content = $content -replace 'à', 'à'
    $content = $content -replace 'â', 'â'
    $content = $content -replace 'ä', 'ä'
    $content = $content -replace 'î', 'î'
    $content = $content -replace 'ï', 'ï'
    $content = $content -replace 'ô', 'ô'
    $content = $content -replace 'ö', 'ö'
    $content = $content -replace 'ù', 'ù'
    $content = $content -replace 'û', 'û'
    $content = $content -replace 'ü', 'ü'
    $content = $content -replace 'ÿ', 'ÿ'
    $content = $content -replace 'ç', 'ç'
    $content = $content -replace 'œ', 'œ'
    $content = $content -replace 'æ', 'æ'
    $content = $content -replace '«', '«'
    $content = $content -replace '»', '»'
    $content = $content -replace '€', '€'
    $content = $content -replace '', ''
    
    # Retourner le contenu nettoyé
    return $content
}
# Nettoyer les fichiers HTML
Get-ChildItem -Path . -Filter "*.html" -Recurse | ForEach-Object {
    try {
        $content = Get-Content $_.FullName -Raw -Encoding UTF8
        $cleanContent = Clean-HtmlContent -content $content
        [System.IO.File]::WriteAllText($_.FullName, $cleanContent, [System.Text.Encoding]::UTF8)
        Write-Host "Nettoyé: $($_.Name)"
    }
    catch {
        Write-Host "Erreur lors du traitement de $($_.Name): $_" -ForegroundColor Red
    }
}

Write-Host "Traitement terminé. Une sauvegarde a étàcréée dans: $backupDir"