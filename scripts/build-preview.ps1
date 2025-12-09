# Build a combined preview of all tracked .html fiches (excluding .bak files)
$files = git ls-files "*.html" | Where-Object { -not $_.EndsWith('.bak') -and $_ -ne 'preview/combined-fiches.html' }
if (-not $files) { Write-Output "No .html files found via git ls-files."; exit 0 }
New-Item -ItemType Directory -Force -Path preview | Out-Null
$out = Join-Path (Get-Location) 'preview\combined-fiches.html'
$head = @'
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Combined Fiches Preview</title>
<style>
  body{font-family:Segoe UI,Arial,sans-serif;margin:0}
  nav{position:fixed;left:0;top:0;bottom:0;width:260px;overflow:auto;padding:16px;background:#f7f7f7;border-right:1px solid #ddd}
  main{margin-left:280px;padding:20px}
  section{margin-bottom:60px;padding:12px;border-bottom:1px solid #eee}
  h1{font-size:18px;margin:0 0 12px}
  h2{margin:0 0 10px;font-size:16px}
  a{color:#0366d6}
</style>
</head>
<body>
<nav>
<h1>Fiches</h1>
<ul>
'@

Set-Content -Path $out -Value $head -Encoding UTF8

foreach ($f in $files) {
    $rel = $f.Trim()
    $linkName = [IO.Path]::GetFileName($rel)
    $uid = [guid]::NewGuid().ToString()
    Add-Content -Path $out -Value ("<li><a href='#$uid'>$linkName</a></li>")
}

Add-Content -Path $out -Value "</ul></nav><main>"

foreach ($f in $files) {
    $rel = $f.Trim()
    $name = [IO.Path]::GetFileName($rel)
    $id = [guid]::NewGuid().ToString()
    try {
        $html = Get-Content -Raw -Path $rel -ErrorAction Stop
    }
    catch {
        $html = "<!-- Failed to read $rel -->"
    }
    $bodyMatch = [regex]::Match($html,'(?is)<body.*?>(.*?)</body>')
    if ($bodyMatch.Success) { $body = $bodyMatch.Groups[1].Value } else { $body = $html }
    Add-Content -Path $out -Value ("<section id='$id'><h2>$name</h2>$body</section>")
}

Add-Content -Path $out -Value "</main></body></html>"
Write-Output "Preview built: $out"