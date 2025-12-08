# PowerShell script to convert .html files to UTF-8 and fix common mojibake sequences
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\fix-mojibake.ps1

$root = (Get-Location).Path
$files = Get-ChildItem -Path $root -Filter *.html -Recurse

$root = (Get-Location).Path
$files = Get-ChildItem -Path $root -Filter *.html -Recurse

if ($files.Count -eq 0) {
    Write-Output "No .html files found under $root"
    exit 0
}

# This script avoids embedding non-ASCII literals to remain safe with PowerShell parsing.
# Strategy:
# 1) Read raw bytes of each file.
# 2) Try decoding as UTF8 and count occurrences of the typical mojibake marker 'Ã' (U+00C3)
# 3) If many 'Ã' occur in UTF8 decoding, decode bytes as Windows-1252 and use that result.
# 4) Remove stray U+00C2 (\u00C2) characters that commonly precede punctuation after bad decodes.

$marker = [char]0x00C3  # marker for mojibake when CP1252 bytes were misinterpreted as UTF8
$strayA = [char]0x00C2  # 'Â' often appears before punctuation after bad encodings
$replacementChar = [char]0xFFFD

foreach ($f in $files) {
    $path = $f.FullName
    Write-Output "Backing up: $path -> $path.bak"
    Copy-Item -Path $path -Destination "$path.bak" -Force

    try {
        $bytes = [System.IO.File]::ReadAllBytes($path)
    }
    catch {
        Write-Output ("Failed to read bytes from {0}: {1}" -f $path, $_)
        continue
    }

    # Decode as UTF8 and check for mojibake marker frequency
    $utf8str = [System.Text.Encoding]::UTF8.GetString($bytes)
    $markerCount = ([regex]::Matches($utf8str, [regex]::Escape($marker))).Count

    if ($markerCount -gt 2) {
        # Likely CP1252 bytes interpreted wrongly. Decode as CP1252 then write UTF8.
        $content = [System.Text.Encoding]::GetEncoding(1252).GetString($bytes)
        Write-Output "  -> Detected mojibake markers ($markerCount). Decoding bytes as Windows-1252."
    }
    else {
        # UTF8 seems fine
        $content = $utf8str
        Write-Output "  -> No significant mojibake markers ($markerCount). Leaving as UTF8-decoded content."
    }

    # Remove stray U+00C2 (Â) that sometimes appears before punctuation or currency symbol
    try {
        $pattern = [regex]::Escape($strayA) + '(?=[\p{P}\p{S}])'
        $content = [regex]::Replace($content, $pattern, '')
    }
    catch {
        # if regex fails for some reason, continue without this step
    }

    # Remove Unicode replacement characters if any
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

Write-Output "Done. All .html files processed. Backups saved with .bak extension."
