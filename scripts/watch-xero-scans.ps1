param(
  [string]$TrackerUrl = "https://track-snowy.vercel.app",
  [string]$ApiKey = $env:SCANNER_API_KEY,
  [string]$ScanDir = (Join-Path (Get-Location) "XeroScans"),
  [int]$IntervalSeconds = 3
)

$ErrorActionPreference = "Stop"

if (-not $ApiKey) {
  throw "Missing API key. Set SCANNER_API_KEY first or pass -ApiKey."
}

if (-not (Test-Path -LiteralPath $ScanDir)) {
  New-Item -ItemType Directory -Path $ScanDir | Out-Null
}

$sent = @{}

function Send-XeroScan {
  param([System.IO.FileInfo]$File)

  if ($sent.ContainsKey($File.FullName) -and $sent[$File.FullName] -eq $File.LastWriteTimeUtc.Ticks) {
    return
  }

  $json = Get-Content -LiteralPath $File.FullName -Raw
  $headers = @{
    Authorization = "Bearer $ApiKey"
    "X-Scanner-Id" = "xero-folder-watch"
  }

  $response = Invoke-RestMethod `
    -Uri ($TrackerUrl.TrimEnd("/") + "/api/scans") `
    -Method Post `
    -ContentType "application/json" `
    -Headers $headers `
    -Body $json

  $sent[$File.FullName] = $File.LastWriteTimeUtc.Ticks
  $name = $response.data.username
  if (-not $name) {
    $name = $File.BaseName
  }
  Write-Host ("Uploaded scan for {0}" -f $name)
}

Write-Host ("Watching {0}" -f (Resolve-Path -LiteralPath $ScanDir))
Write-Host ("Tracker: {0}" -f $TrackerUrl)
Write-Host "Keep this window open while you export scans."

while ($true) {
  Get-ChildItem -LiteralPath $ScanDir -Filter "*-item-scan.json" -File |
    Sort-Object LastWriteTimeUtc |
    ForEach-Object {
      try {
        Send-XeroScan -File $_
      } catch {
        Write-Warning ("Cannot upload {0}: {1}" -f $_.Name, $_.Exception.Message)
      }
    }

  Start-Sleep -Seconds $IntervalSeconds
}
