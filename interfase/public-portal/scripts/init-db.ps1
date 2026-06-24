# Creates public_portal database and otp_codes table
$env:PGPASSWORD = "1q2w3e4r5t"
$psql = "psql"
if (Get-Command psql -ErrorAction SilentlyContinue) {
  & $psql -U postgres -h localhost -p 5432 -f "$PSScriptRoot\..\scripts\init-db.sql"
  Write-Host "Database initialized."
} else {
  Write-Host "psql not found. Run scripts/init-db.sql manually in pgAdmin or psql."
}
