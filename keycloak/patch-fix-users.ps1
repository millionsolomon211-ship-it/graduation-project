# Clear VERIFY_EMAIL required action from all users (fixes "Account is not fully set up")
$body = "grant_type=password&client_id=admin-cli&username=admin&password=admin"
$token = (Invoke-RestMethod -Uri "http://localhost:8081/auth/realms/master/protocol/openid-connect/token" `
  -Method POST -ContentType "application/x-www-form-urlencoded" -Body $body).access_token

$headers = @{ Authorization = "Bearer $token" }
$realm = "public-citizen-portal"

$users = Invoke-RestMethod -Uri "http://localhost:8081/auth/admin/realms/$realm/users?max=500" -Headers $headers
$fixed = 0

foreach ($u in $users) {
  $full = Invoke-RestMethod -Uri "http://localhost:8081/auth/admin/realms/$realm/users/$($u.id)" -Headers $headers
  if ($full.requiredActions -contains "VERIFY_EMAIL") {
    $full.requiredActions = @($full.requiredActions | Where-Object { $_ -ne "VERIFY_EMAIL" })
    $full.emailVerified = $false
    Invoke-RestMethod -Uri "http://localhost:8081/auth/admin/realms/$realm/users/$($u.id)" `
      -Method PUT -Headers $headers -ContentType "application/json" `
      -Body ($full | ConvertTo-Json -Depth 10)
    $fixed++
    Write-Host "Fixed user: $($full.email)"
  }
}

Write-Host "Done. Cleared VERIFY_EMAIL from $fixed user(s)."
