# BookKeeper Pro - Stop Script

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BookKeeper Pro - Stopping Application" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Stopping all Node processes..." -ForegroundColor Yellow

$processes = Get-Process node -ErrorAction SilentlyContinue

if ($processes) {
    $processes | Stop-Process -Force
    Write-Host "Stopped $($processes.Count) process(es)" -ForegroundColor Green
} else {
    Write-Host "No Node processes found running." -ForegroundColor Gray
}

Write-Host ""
Write-Host "Application stopped." -ForegroundColor Green
Write-Host ""

