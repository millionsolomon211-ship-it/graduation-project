# Test full signup flow: register a user then log in with their credentials

$KC_URL   = "http://localhost:8081/auth"
$REALM    = "public-citizen-portal"
$CLIENT   = "civilian-nextjs-web"
$TEST_EMAIL = "test.citizen@example.com"
$TEST_PASS  = "TestPass123!"

# 1. Get admin token
$body  = "grant_type=password&client_id=admin-cli&username=admin&password=admin"
$token = (Invoke-RestMethod -Uri "$KC_URL/realms/master/protocol/openid-connect/token" `
  -Method POST -ContentType "application/x-www-form-urlencoded" -Body $body).access_token
Write-Host "[1] Admin token obtained"

# 2. Delete the test user if they already exist (clean slate)
$users = Invoke-RestMethod -Uri "$KC_URL/admin/realms/$REALM/users?email=$TEST_EMAIL" `
  -Headers @{ Authorization = "Bearer $token" }
if ($users.Count -gt 0) {
  Invoke-RestMethod -Uri "$KC_URL/admin/realms/$REALM/users/$($users[0].id)" `
    -Method DELETE -Headers @{ Authorization = "Bearer $token" }
  Write-Host "[2] Removed existing test user"
}

# 3. Register user (mimics what SignupForm does)
$newUser = @{
  firstName     = "Test"
  lastName      = "Citizen"
  email         = $TEST_EMAIL
  username      = $TEST_EMAIL
  enabled       = $true
  emailVerified = $false
  credentials   = @(@{ type = "password"; value = $TEST_PASS; temporary = $false })
} | ConvertTo-Json -Depth 5

$regResp = Invoke-WebRequest -Uri "$KC_URL/admin/realms/$REALM/users" `
  -Method POST -ContentType "application/json" `
  -Headers @{ Authorization = "Bearer $token" } -Body $newUser
Write-Host "[3] User registered — HTTP $($regResp.StatusCode)"

# 4. Login as that user (mimics what LoginForm does)
$loginBody = @{
  grant_type = "password"
  client_id  = $CLIENT
  username   = $TEST_EMAIL
  password   = $TEST_PASS
}
$loginResp  = Invoke-RestMethod -Uri "$KC_URL/realms/$REALM/protocol/openid-connect/token" `
  -Method POST -ContentType "application/x-www-form-urlencoded" -Body $loginBody
Write-Host "[4] Login SUCCESS — got access_token starting with: $($loginResp.access_token.Substring(0,30))..."
Write-Host ""
Write-Host "Signup + Login flow is WORKING correctly."
