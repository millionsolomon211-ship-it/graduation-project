# Configure Keycloak SMTP + email verification for public-citizen-portal
$kcBase = "http://localhost:8081/auth"
$realm = "public-citizen-portal"

$body = "grant_type=password&client_id=admin-cli&username=admin&password=admin"
$resp = Invoke-RestMethod `
  -Uri "$kcBase/realms/master/protocol/openid-connect/token" `
  -Method POST `
  -ContentType "application/x-www-form-urlencoded" `
  -Body $body

$token = $resp.access_token
Write-Host "Got admin token"

$headers = @{ Authorization = "Bearer $token" }

$patch = @{
  verifyEmail = $true
  smtpServer = @{
    host = "smtp.gmail.com"
    port = "587"
    from = "millionsolomon211@gmail.com"
    fromDisplayName = "Citizen Portal"
    replyTo = "millionsolomon211@gmail.com"
    replyToDisplayName = "Citizen Portal"
    envelopeFrom = ""
    ssl = "false"
    starttls = "true"
    auth = "true"
    user = "millionsolomon211@gmail.com"
    password = "jjwp jdzp eetu zajm"
  }
} | ConvertTo-Json -Depth 4

Invoke-RestMethod `
  -Uri "$kcBase/admin/realms/$realm" `
  -Method PUT `
  -ContentType "application/json" `
  -Headers $headers `
  -Body $patch

Write-Host "SMTP + verifyEmail patched on realm '$realm'"
