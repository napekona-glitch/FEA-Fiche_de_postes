# Create backup directory
$backupDir = "C:\Users\NapéKONA\Documents\filiere_Architecture\Fiche_de_postes\backup"
if (-not (Test-Path $backupDir)) { New-Item -ItemType Directory -Path $backupDir | Out-Null }

# Get all HTML files
$files = Get-ChildItem -Path "C:\Users\NapéKONA\Documents\filiere_Architecture\Fiche_de_postes\*.html" -Recurse

# Define character replacements
$replacements = @{
    "Filière" = "Filière"
    "Excellence" = "Excellence"
    "› Retour à" = "› Retour à"
    "à l'index" = "à l'index"
    "Évaluation" = "Évaluation"
}

foreach ($file in $files) {
    # Create backup
    $backupPath = Join-Path $backupDir $file.Name
    Copy-Item $file.FullName -Destination $backupPath -Force

    # Read and fix content
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    foreach ($key in $replacements.Keys) {
        $content = $content -replace [regex]::Escape($key), $replacements[$key]
    }

    # Save with proper encoding
    [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.UTF8Encoding]::new($false))
    Write-Host "Processed: $($file.Name)"
}

Write-Host "`nAll files have been processed. Backups saved to: $backupDir" -ForegroundColor Green