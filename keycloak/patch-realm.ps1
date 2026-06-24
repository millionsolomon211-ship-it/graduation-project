# Patch realm: allow email login + disable Keycloak built-in verify (we use OTP)
$body = "grant_type=password&client_id=admin-cli&username=admin&password=admin"
$resp = Invoke-RestMethod `
  -Uri "http://localhost:8081/auth/realms/master/protocol/openid-connect/token" `
  -Method POST `
  -ContentType "application/x-www-form-urlencoded" `
  -Body $body

$token = $resp.access_token
Write-Host "Got admin token"

$patch = @{
  loginWithEmailAllowed = $true
  registrationEmailAsUsername = $true
  registrationAllowed = $true
  duplicateEmailsAllowed = $false
  resetPasswordAllowed = $true
  verifyEmail = $false
} | ConvertTo-Json

$headers = @{ Authorization = "Bearer $token" }

Invoke-RestMethod `
  -Uri "http://localhost:8081/auth/admin/realms/public-citizen-portal" `
  -Method PUT `
  -ContentType "application/json" `
  -Headers $headers `
  -Body $patch

Write-Host "Realm patched (verifyEmail=false, OTP handled by portal)"
