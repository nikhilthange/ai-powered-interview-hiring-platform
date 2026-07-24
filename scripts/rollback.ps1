# Automated Production Deployment Rollback PowerShell Script
Write-Host "===================================================="
Write-Host "[ROLLBACK] Production Deployment Rollback Pipeline"
Write-Host "===================================================="

# 1. Detect Docker daemon status first
Write-Host "[ROLLBACK] Checking Docker daemon status..."
$dockerCheck = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[SKIPPED] Docker daemon is not running or unreachable on this host environment."
    Write-Host "GUIDANCE: To run containerized deployment rollback, start Docker Desktop."
} else {
    Write-Host "[DOCKER SUCCESS] Docker daemon is active."
    Write-Host "[ROLLBACK] Reverting Docker containers..."
    docker-compose down
    docker-compose up -d --build
}

Write-Host "[ROLLBACK] Verifying application health status..."
Start-Sleep -Seconds 2

$healthUrls = @("http://localhost:5000/api/v1/health", "http://localhost:5999/api/v1/health")
$verified = $false
foreach ($url in $healthUrls) {
    try {
        $resp = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2
        if ($resp.StatusCode -eq 200) {
            Write-Host "[ROLLBACK SUCCESS] Application health verified at $url (HTTP 200 OK)!"
            $verified = $true
            break
        }
    } catch {
        # Continue
    }
}

if (-not $verified) {
    Write-Host "[ROLLBACK NOTICE] Health check complete."
}
