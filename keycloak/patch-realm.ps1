# Get admin token
$body = "grant_type=password&client_id=admin-cli&username=admin&password=admin"
$resp = Invoke-RestMethod `
  -Uri "http://localhost:8081/auth/realms/master/protocol/openid-connect/token" `
  -Method POST `
  -ContentType "application/x-www-form-urlencoded" `
  -Body $body

$token = $resp.access_token
Write-Host "Got admin token"

# Patch realm so users can register and log in with email
$patch = '{"loginWithEmailAllowed":true,"registrationEmailAsUsername":true,"registrationAllowed":true,"duplicateEmailsAllowed":false,"resetPasswordAllowed":true}'

$headers = @{ Authorization = "Bearer $token" }

Invoke-RestMethod `
  -Uri "http://localhost:8081/auth/admin/realms/public-citizen-portal" `
  -Method PUT `
  -ContentType "application/json" `
  -Headers $headers `
  -Body $patch

Write-Host "Realm patched successfully"
