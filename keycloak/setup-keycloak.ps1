# One-time setup: recreate Keycloak + create portal-admin-service client
# WARNING: Recreating the container resets Keycloak data (users, SMTP tweaks in UI).

param(
  [string]$KcBase = "http://localhost:8081/auth",
  [switch]$SkipRecreate
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

if (-not $SkipRecreate) {
  Write-Host "Recreating Keycloak container (fresh admin/admin + realm import)..."
  Push-Location $root
  docker compose down
  docker compose up -d
  Pop-Location

  Write-Host "Waiting for Keycloak..."
  for ($i = 1; $i -le 24; $i++) {
    try {
      Invoke-RestMethod -Uri "$KcBase/realms/public-citizen-portal" -Method GET | Out-Null
      break
    } catch {
      Start-Sleep -Seconds 5
    }
  }
}

& "$PSScriptRoot\patch-service-client.ps1" -KcBase $KcBase
Write-Host ""
Write-Host "Done. Restart public-portal: cd interfase/public-portal && npm run dev"
