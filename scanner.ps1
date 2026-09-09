param([string]$TrackerUrl = "https://track-snowy.vercel.app")

$snapshot = @{
  robloxUserId = "123456789"
  username = "AuthorizedDemo"
  displayName = "Authorized Demo"
  timestamp = (Get-Date).ToUniversalTime().ToString("o")
  level = 2550; maxLevel = 2550; sea = "Sea 3"
  beli = 12500000; fragments = 8200; fruit = "Magnet"; fruitMastery = 300
  fightingStyle = "Godhuman"; swords = @("Cursed Dual Katana"); guns = @("Skull Guitar")
  accessories = @("Valkyrie Helm"); materials = @{ "Dark Fragment" = 3; "Mirror Fractal" = 2 }
  race = "Human"; raceVersion = "V3"; bountyHonor = 0; awakenedMoves = 0
  gamepasses = @(); legendaryItems = @("Mirror Fractal", "Dark Fragment")
  status = "Ready"; isOnline = $false
  ownedItems = @{
    godhuman = 1; sanguine_art = 0; cursed_dual_katana = 1; shark_anchor = 0
    mirror_fractal = 2; dark_fragment = 3; valkyrie_helm = 1; skull_guitar = 1
    control = 1; dough = 2; dragon = 1; magnet = 1; gas = 0; gravity = 1
    kitsune = 1; tiger = 0; lightning = 1; yeti = 0; mammoth = 1
    shadow = 1; spirit = 0; trex = 1; venom = 1
  }
  lastUpdated = (Get-Date).ToUniversalTime().ToString("o")
  note = "Imported locally from scanner.ps1"
}

$json = $snapshot | ConvertTo-Json -Depth 8 -Compress
$bytes = [Text.Encoding]::UTF8.GetBytes($json)
$token = [Convert]::ToBase64String($bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_')
$url = "$($TrackerUrl.TrimEnd('/'))/#scan=$token"
Write-Host "Opening FruitVault test import..." -ForegroundColor Cyan
Start-Process $url
