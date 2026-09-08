param(
  [string]$TrackerUrl = "http://localhost:3000",
  [Parameter(Mandatory = $true)][string]$ApiKey,
  [string]$ScannerId = "windows-scanner"
)

$payload = @{
  robloxUserId = "123456789"
  username = "AuthorizedDemo"
  displayName = "Authorized Demo"
  timestamp = (Get-Date).ToUniversalTime().ToString("o")
  stats = @{
    level = 2550
    beli = 12500000
    fragments = 8200
    currentFruit = "Magnet"
    race = "Human"
    sea = 3
    melee = "Godhuman"
    sword = "Cursed Dual Katana"
  }
  items = @(
    @{ key = "magnet"; quantity = 1; owned = $true }
    @{ key = "godhuman"; quantity = 1; owned = $true }
    @{ key = "cursed_dual_katana"; quantity = 1; owned = $true }
  )
} | ConvertTo-Json -Depth 6

$headers = @{
  Authorization = "Bearer $ApiKey"
  "X-Scanner-Id" = $ScannerId
}

try {
  $result = Invoke-RestMethod -Uri "$($TrackerUrl.TrimEnd('/'))/api/scans" -Method Post -ContentType "application/json" -Headers $headers -Body $payload
  Write-Host "Scan uploaded successfully." -ForegroundColor Green
  $result | ConvertTo-Json -Depth 6
} catch {
  Write-Host "Scan upload failed: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}
