# eShop Load Test Quick Run Script
# Usage: .\run-tests.ps1 -scenario realistic -baseUrl http://localhost:5222

param(
    [string]$scenario = "realistic",
    [string]$baseUrl = "http://localhost:5222"
)

$scenarioFile = "catalog-$scenario.js"

if (-not (Test-Path $scenarioFile)) {
    Write-Host "❌ Scenario script not found: $scenarioFile" -ForegroundColor Red
    Write-Host ""
    Write-Host "Available scenarios:" -ForegroundColor Yellow
    Write-Host "  - browse     (Basic browse, fast)"
    Write-Host "  - search     (Search test)"
    Write-Host "  - realistic  (Realistic mix, recommended) ⭐"
    exit 1
}

Write-Host "Starting load test..." -ForegroundColor Green
Write-Host "Scenario: $scenario" -ForegroundColor Cyan
Write-Host "API: $baseUrl" -ForegroundColor Cyan
Write-Host ""

k6 run $scenarioFile -e BASE_URL=$baseUrl

Write-Host ""
Write-Host "✅ Test complete! Check the summary above." -ForegroundColor Green