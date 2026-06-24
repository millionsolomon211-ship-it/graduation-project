# Creates portal-admin-service client for Next.js server → Keycloak Admin API
# Usage: .\patch-service-client.ps1
#        .\patch-service-client.ps1 -AdminPassword "your-keycloak-admin-password"

param(
  [string]$KcBase = "http://localhost/auth",
  [string]$Realm = "public-citizen-portal",
  [string]$AdminUser = "admin",
  [string]$AdminPassword = "admin",
  [string]$ServiceClientId = "portal-admin-service",
  [string]$ServiceClientSecret = "portal-admin-secret"
)

Write-Host "Connecting to Keycloak at $KcBase ..."

$tokenBody = "grant_type=password&client_id=admin-cli&username=$AdminUser&password=$AdminPassword"
try {
  $tokenResp = Invoke-RestMethod `
    -Uri "$KcBase/realms/master/protocol/openid-connect/token" `
    -Method POST `
    -ContentType "application/x-www-form-urlencoded" `
    -Body $tokenBody
} catch {
  Write-Host "ERROR: Could not get master admin token. Use your Keycloak admin password:"
  Write-Host "  .\patch-service-client.ps1 -AdminPassword `"YOUR_PASSWORD`""
  exit 1
}

$token = $tokenResp.access_token
$headers = @{ Authorization = "Bearer $token" }
Write-Host "[1] Got master admin token"

# Check if client already exists
$existing = Invoke-RestMethod `
  -Uri "$KcBase/admin/realms/$Realm/clients?clientId=$ServiceClientId" `
  -Headers $headers

if ($existing.Count -gt 0) {
  $clientUuid = $existing[0].id
  Write-Host "[2] Client '$ServiceClientId' already exists ($clientUuid)"
} else {
  $newClient = @{
    clientId = $ServiceClientId
    name = "Portal Admin Service"
    enabled = $true
    publicClient = $false
    serviceAccountsEnabled = $true
    standardFlowEnabled = $false
    directAccessGrantsEnabled = $false
    secret = $ServiceClientSecret
    protocol = "openid-connect"
  } | ConvertTo-Json

  Invoke-RestMethod `
    -Uri "$KcBase/admin/realms/$Realm/clients" `
    -Method POST `
    -ContentType "application/json" `
    -Headers $headers `
    -Body $newClient

  $existing = Invoke-RestMethod `
    -Uri "$KcBase/admin/realms/$Realm/clients?clientId=$ServiceClientId" `
    -Headers $headers
  $clientUuid = $existing[0].id
  Write-Host "[2] Created client '$ServiceClientId' ($clientUuid)"
}

# realm-management client + roles
$rmClients = Invoke-RestMethod `
  -Uri "$KcBase/admin/realms/$Realm/clients?clientId=realm-management" `
  -Headers $headers
$rmClientId = $rmClients[0].id

$roles = Invoke-RestMethod `
  -Uri "$KcBase/admin/realms/$Realm/clients/$rmClientId/roles" `
  -Headers $headers
$neededRoles = $roles | Where-Object { $_.name -in @('manage-users', 'view-users', 'query-users') }

# Service account user
$saUsers = Invoke-RestMethod `
  -Uri "$KcBase/admin/realms/$Realm/clients/$clientUuid/service-account-user" `
  -Headers $headers
$saUserId = $saUsers.id

Invoke-RestMethod `
  -Uri "$KcBase/admin/realms/$Realm/users/$saUserId/role-mappings/clients/$rmClientId" `
  -Method POST `
  -ContentType "application/json" `
  -Headers $headers `
  -Body ($neededRoles | ConvertTo-Json)

Write-Host "[3] Assigned manage-users roles to service account"

# Test service account token
$svcBody = "grant_type=client_credentials&client_id=$ServiceClientId&client_secret=$ServiceClientSecret"
$svcToken = Invoke-RestMethod `
  -Uri "$KcBase/realms/$Realm/protocol/openid-connect/token" `
  -Method POST `
  -ContentType "application/x-www-form-urlencoded" `
  -Body $svcBody

Write-Host "[4] Service account token OK"
Write-Host ""
Write-Host "Add to interfase/public-portal/.env.local:"
Write-Host "  KEYCLOAK_SERVER_URL=$KcBase"
Write-Host "  KEYCLOAK_SERVICE_CLIENT_ID=$ServiceClientId"
Write-Host "  KEYCLOAK_SERVICE_CLIENT_SECRET=$ServiceClientSecret"
Write-Host ""
Write-Host "Then restart: npm run dev"
