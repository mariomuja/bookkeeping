# Pre-Deployment Check Script
# Ensures all changes are committed and pushed before Vercel deployment

param(
    [Parameter(Mandatory=$false)]
    [string]$AppPath = "."
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Pre-Deployment Check" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Push-Location $AppPath

# Check 1: Uncommitted changes
Write-Host "✓ Checking for uncommitted changes..." -ForegroundColor Yellow
$status = git status --porcelain
if ($status) {
    Write-Host "❌ FEHLER: Es gibt uncommittete Änderungen:" -ForegroundColor Red
    git status --short
    Write-Host ""
    Write-Host "Bitte committen mit: git add -A && git commit -m 'your message'" -ForegroundColor Yellow
    Pop-Location
    exit 1
}
Write-Host "  ✅ Keine uncommitteten Änderungen" -ForegroundColor Green
Write-Host ""

# Check 2: Unpushed commits
Write-Host "✓ Checking for unpushed commits..." -ForegroundColor Yellow
$branch = git rev-parse --abbrev-ref HEAD
$local = git rev-parse $branch
$remote = git rev-parse origin/$branch 2>$null

if ($local -ne $remote) {
    Write-Host "❌ FEHLER: Lokale Commits sind noch nicht gepusht!" -ForegroundColor Red
    Write-Host ""
    git log origin/$branch..$branch --oneline
    Write-Host ""
    Write-Host "Bitte pushen mit: git push" -ForegroundColor Yellow
    Pop-Location
    exit 1
}
Write-Host "  ✅ Alle Commits sind gepusht" -ForegroundColor Green
Write-Host ""

# Check 3: Remote is up to date
Write-Host "✓ Checking if remote is reachable..." -ForegroundColor Yellow
git fetch --dry-run 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  WARNING: Konnte Remote nicht erreichen" -ForegroundColor Yellow
} else {
    Write-Host "  ✅ Remote ist erreichbar" -ForegroundColor Green
}
Write-Host ""

# Check 4: Latest commit hash
$latestCommit = git rev-parse --short HEAD
$latestMessage = git log -1 --pretty=%B
Write-Host "Latest Commit:" -ForegroundColor Cyan
Write-Host "  Hash: $latestCommit" -ForegroundColor White
Write-Host "  Message: $latestMessage" -ForegroundColor White
Write-Host ""

# Check 5: Critical files exist
Write-Host "✓ Checking critical files..." -ForegroundColor Yellow
$criticalFiles = @(
    "package.json",
    "vercel.json"
)

$missingFiles = @()
foreach ($file in $criticalFiles) {
    if (-not (Test-Path $file)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "❌ FEHLER: Wichtige Dateien fehlen:" -ForegroundColor Red
    $missingFiles | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    Pop-Location
    exit 1
}
Write-Host "  ✅ Alle wichtigen Dateien vorhanden" -ForegroundColor Green
Write-Host ""

# Check 6: Check for .tgz files referenced in package.json
Write-Host "✓ Checking for local package references..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
    $deps = $packageJson.dependencies.PSObject.Properties | Where-Object { $_.Value -like "file:*.tgz" }
    
    foreach ($dep in $deps) {
        $tgzPath = $dep.Value -replace "file:", ""
        $tgzPath = $tgzPath -replace "^\./", ""
        
        if (-not (Test-Path $tgzPath)) {
            Write-Host "❌ FEHLER: Referenced .tgz file nicht gefunden: $tgzPath" -ForegroundColor Red
            Pop-Location
            exit 1
        }
        
        # Check if .tgz is tracked by git
        $tracked = git ls-files $tgzPath
        if (-not $tracked) {
            Write-Host "❌ FEHLER: .tgz Datei nicht in Git getrackt: $tgzPath" -ForegroundColor Red
            Write-Host "  Hinzufügen mit: git add -f $tgzPath" -ForegroundColor Yellow
            Pop-Location
            exit 1
        }
    }
    
    if ($deps.Count -gt 0) {
        Write-Host "  ✅ Alle lokalen Pakete sind getrackt" -ForegroundColor Green
    } else {
        Write-Host "  ℹ️  Keine lokalen Paket-Referenzen gefunden" -ForegroundColor Gray
    }
}
Write-Host ""

# SUCCESS
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ ALLE CHECKS BESTANDEN!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Bereit für Deployment zu Vercel!" -ForegroundColor Green
Write-Host "Commit: $latestCommit" -ForegroundColor Cyan
Write-Host ""

Pop-Location
exit 0

