$src = "content/fragments"
$out = "word"

New-Item -ItemType Directory -Force -Path $out | Out-Null

Get-ChildItem -Recurse -Filter *.qmd $src | ForEach-Object {
    $dir = $_.DirectoryName
    $name = [System.IO.Path]::GetFileNameWithoutExtension($_.Name)
    $docx = Join-Path $dir "$name.docx"
    $target = Join-Path $out "$name.docx"

    Write-Host "Rendering $($_.FullName)"
    quarto render $_.FullName --to docx

    if (Test-Path $docx) {
        Move-Item -Force $docx $target
        Write-Host "Moved → $target"
    } else {
        Write-Warning "Expected output not found: $docx"
    }
}