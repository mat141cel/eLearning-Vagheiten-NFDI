$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Src = Join-Path $ScriptDir "content"
$Out = Join-Path $Src "fragments"

New-Item -ItemType Directory -Force -Path $Out | Out-Null

Get-ChildItem -Path $Src -Recurse -Filter *.qmd | ForEach-Object {
    $file = $_
    $filename = $file.Name

    # Skip output directory files
    if ($file.FullName -like "$Out*") {
        return
    }

    # Skip combined and already-generated files
    if ($filename -like "*_combined.qmd" -or $filename -like "*.inc.qmd") {
        return
    }

    # Preserve relative path to avoid name collisions
    $relPath = $file.FullName.Substring($Src.Length).TrimStart('\','/')
    $outPath = Join-Path $Out ($relPath -replace '\.qmd$', '.inc.qmd')

    $outDir = Split-Path -Parent $outPath
    New-Item -ItemType Directory -Force -Path $outDir | Out-Null

    # Remove YAML front matter
    $inYaml = $false
    $outputLines = @()

    Get-Content $file.FullName | ForEach-Object {
        if ($_ -match '^---\s*$') {
            $inYaml = -not $inYaml
            return
        }

        if (-not $inYaml) {
            $outputLines += $_
        }
    }

    # Write output (overwrite)
    Set-Content -Path $outPath -Value $outputLines

    Write-Host "generated: $outPath"
}