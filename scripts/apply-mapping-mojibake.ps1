#!/usr/bin/env pwsh
# Apply deterministic mapping replacements for common mojibake sequences
# This script reads each .html as UTF8 text and replaces known mis-decoded sequences

$root = (Get-Location).Path
$files = Get-ChildItem -Path $root -Filter *.html -Recurse | Where-Object { -not $_.Name.EndsWith('.bak') -and -not $_.FullName.Contains('\\preview\\') }
if ($files.Count -eq 0) { Write-Output "No .html files found to process."; exit 0 }

# Helper to build strings from code points
function BuildFromCodes([int[]] $codes) {
    return -join ($codes | ForEach-Object { [char]$_ })
}

# Mapping: from (mojibake sequence) -> to (correct unicode)
$mappings = @(
    @{from = BuildFromCodes @(0x00C3,0x00A9); to = BuildFromCodes @(0x00E9)}; # Ã© -> é
    @{from = BuildFromCodes @(0x00C3,0x00A8); to = BuildFromCodes @(0x00E8)}; # Ã¨ -> è
    @{from = BuildFromCodes @(0x00C3,0x00AA); to = BuildFromCodes @(0x00EA)}; # Ãª -> ê
    @{from = BuildFromCodes @(0x00C3,0x00AB); to = BuildFromCodes @(0x00EB)}; # Ã« -> ë
    @{from = BuildFromCodes @(0x00C3,0x00A0); to = BuildFromCodes @(0x00E0)}; # Ã  -> à
    @{from = BuildFromCodes @(0x00C3,0x00A2); to = BuildFromCodes @(0x00E2)}; # Ã¢ -> â
    @{from = BuildFromCodes @(0x00C3,0x00B4); to = BuildFromCodes @(0x00F4)}; # Ã´ -> ô
    @{from = BuildFromCodes @(0x00C3,0x00B9); to = BuildFromCodes @(0x00F9)}; # Ã¹ -> ù
    @{from = BuildFromCodes @(0x00C3,0x00BB); to = BuildFromCodes @(0x00FB)}; # Ã» -> û
    @{from = BuildFromCodes @(0x00C3,0x00AE); to = BuildFromCodes @(0x00EE)}; # Ã® -> î
    @{from = BuildFromCodes @(0x00C3,0x00B6); to = BuildFromCodes @(0x00F6)}; # Ã¶ -> ö
    @{from = BuildFromCodes @(0x00C3,0x00A4); to = BuildFromCodes @(0x00E4)}; # Ã¤ -> ä
    @{from = BuildFromCodes @(0x00C3,0x00A7); to = BuildFromCodes @(0x00E7)}; # Ã§ -> ç
    @{from = BuildFromCodes @(0x00C3,0x00B1); to = BuildFromCodes @(0x00F1)}; # Ã± -> ñ
    @{from = BuildFromCodes @(0x00C5,0x0093); to = BuildFromCodes @(0x0153)}; # Å“ -> œ

    # Multi-byte mojibake sequences (e.g., â€“ -> –)
    @{from = BuildFromCodes @(0x00E2,0x0080,0x0093); to = BuildFromCodes @(0x2013)}; # â€“ -> en dash
    @{from = BuildFromCodes @(0x00E2,0x0080,0x0094); to = BuildFromCodes @(0x2014)}; # â€” -> em dash
    @{from = BuildFromCodes @(0x00E2,0x0080,0x00A6); to = BuildFromCodes @(0x2026)}; # â€¦ -> …
    @{from = BuildFromCodes @(0x00E2,0x0080,0x0098); to = BuildFromCodes @(0x2018)}; # â€˜ -> ‘
    @{from = BuildFromCodes @(0x00E2,0x0080,0x0099); to = BuildFromCodes @(0x2019)}; # â€™ -> ’
    @{from = BuildFromCodes @(0x00E2,0x0080,0x009C); to = BuildFromCodes @(0x201C)}; # â€œ -> “
    @{from = BuildFromCodes @(0x00E2,0x0080,0x009D); to = BuildFromCodes @(0x201D)}; # â€� -> ”
    @{from = BuildFromCodes @(0x00E2,0x0082,0x00AC); to = BuildFromCodes @(0x20AC)}; # â‚¬ -> €
    @{from = BuildFromCodes @(0x00E2,0x0080,0x00A2); to = BuildFromCodes @(0x2022)}; # â€¢ -> •

    # Copyright / registered with stray Â
    @{from = BuildFromCodes @(0x00C2,0x00A9); to = BuildFromCodes @(0x00A9)}; # Â© -> ©
    @{from = BuildFromCodes @(0x00C2,0x00AE); to = BuildFromCodes @(0x00AE)}; # Â® -> ®
)

Write-Output "Processing $($files.Count) .html files with deterministic mappings..."

foreach ($f in $files) {
    $path = $f.FullName
    Write-Output "Backing up: $path -> $path.bak"
    Copy-Item -Path $path -Destination "$path.bak" -Force

    try {
        $content = Get-Content -Raw -Path $path -Encoding UTF8
    }
    catch {
        Write-Output ("Failed to read {0}: {1}" -f $path, $_)
        continue
    }

    foreach ($m in $mappings) {
        $from = $m.from
        $to = $m.to
        # Use regex escape for the from string
        $esc = [regex]::Escape($from)
        $content = [regex]::Replace($content, $esc, $to)
    }

    # Remove stray U+00C2 (Â) before punctuation or currency symbols
    $stray = BuildFromCodes @(0x00C2)
    try {
        $pattern = [regex]::Escape($stray) + '(?=[\p{P}\p{S}])'
        $content = [regex]::Replace($content, $pattern, '')
    }
    catch { }

    # Remove Unicode replacement characters
    $replacementChar = BuildFromCodes @(0xFFFD)
    $content = $content -replace [regex]::Escape($replacementChar), ''

    # Collapse multiple spaces
    $content = $content -replace '\s{2,}', ' '

    try {
        Set-Content -Path $path -Value $content -Encoding UTF8
        Write-Output "Patched: $path"
    }
    catch {
        Write-Output ("Failed to write {0}: {1}" -f $path, $_)
    }
}

Write-Output "Done applying deterministic mapping replacements. Backups preserved as .bak"
