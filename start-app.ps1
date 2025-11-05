# International Bookkeeping - Silent Startup Script

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  International Bookkeeping - Starting Application" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Step 1: Stop existing processes
Write-Host "[1/4] Stopping existing Node processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1
Write-Host "      Done" -ForegroundColor Green
Write-Host ""

# Step 2: Start Backend
Write-Host "[2/4] Starting Backend Server..." -ForegroundColor Yellow
$backendPath = Join-Path $scriptDir "bookkeeping-backend"
$backendProcess = Start-Process powershell -ArgumentList "-WindowStyle", "Hidden", "-Command", "cd '$backendPath'; node server.js" -PassThru
Start-Sleep -Seconds 3
Write-Host "      Backend PID: $($backendProcess.Id)" -ForegroundColor Green

# Step 3: Test Backend
Write-Host ""
Write-Host "[3/4] Testing Backend connectivity..." -ForegroundColor Yellow
$maxRetries = 5
$retryCount = 0
$backendReady = $false

while (($retryCount -lt $maxRetries) -and (-not $backendReady)) {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method Get -TimeoutSec 2 -ErrorAction Stop
        if ($response.status -eq "ok") {
            $backendReady = $true
            Write-Host "      Backend is ready!" -ForegroundColor Green
            Write-Host "      Version: $($response.version)" -ForegroundColor Gray
            Write-Host "      Entries: $($response.dataStatus.journalEntries)" -ForegroundColor Gray
        }
    }
    catch {
        $retryCount++
        if ($retryCount -lt $maxRetries) {
            Write-Host "      Waiting... (Attempt $retryCount/$maxRetries)" -ForegroundColor Gray
            Start-Sleep -Seconds 2
        }
    }
}

if (-not $backendReady) {
    Write-Host "      Backend failed to start!" -ForegroundColor Red
    Write-Host "      Check: http://localhost:3000/api/health" -ForegroundColor Red
    exit 1
}

# Step 4: Start Frontend
Write-Host ""
Write-Host "[4/4] Starting Frontend Server..." -ForegroundColor Yellow
$frontendPath = Join-Path $scriptDir "bookkeeping-frontend"
$frontendProcess = Start-Process powershell -ArgumentList "-WindowStyle", "Hidden", "-Command", "cd '$frontendPath'; npm start" -PassThru
Write-Host "      Frontend PID: $($frontendProcess.Id)" -ForegroundColor Green
Write-Host "      Compiling... (this takes 10-15 seconds)" -ForegroundColor Gray
Start-Sleep -Seconds 12

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Application Started Successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend: http://localhost:4200" -ForegroundColor White
Write-Host "Backend:  http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Login: demo / demo123" -ForegroundColor Cyan
Write-Host ""
Write-Host "To stop: .\stop-app.ps1" -ForegroundColor Yellow
Write-Host ""

# Open browser
Write-Host "Opening browser..." -ForegroundColor Gray
Start-Sleep -Seconds 2
Start-Process "http://localhost:4200"

Write-Host ""
Write-Host "Done! You can close this window." -ForegroundColor Green
Write-Host ""

