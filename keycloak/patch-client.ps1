# Update Keycloak client redirect URIs for port 3001

$KC_URL = "http://localhost:8081/auth"
$REALM  = "public-citizen-portal"

# Get admin token
$body  = @{ grant_type="password"; client_id="admin-cli"; username="admin"; password="admin" }
$token = (Invoke-RestMethod -Uri "$KC_URL/realms/master/protocol/openid-connect/token" `
  -Method POST -ContentType "application/x-www-form-urlencoded" -Body $body).access_token
Write-Host "[1] Got admin token"

# Find the client
$clients = Invoke-RestMethod -Uri "$KC_URL/admin/realms/$REALM/clients?clientId=civilian-nextjs-web" `
  -Headers @{ Authorization = "Bearer $token" }
$clientId = $clients[0].id
Write-Host "[2] Found client id: $clientId"

# Patch redirect URIs to include both 3000 and 3001, and explicitly enable Custom Login form Support (Direct Access Grants)
$patch = '{"redirectUris":["http://localhost:3000/*","http://localhost:3001/*"],"webOrigins":["http://localhost:3000","http://localhost:3001"],"directAccessGrantsEnabled":true,"publicClient":true}'

Invoke-RestMethod -Uri "$KC_URL/admin/realms/$REALM/clients/$clientId" `
  -Method PUT -ContentType "application/json" `
  -Headers @{ Authorization = "Bearer $token" } -Body $patch
Write-Host "[3] Client redirect URIs updated for ports 3000 and 3001"
