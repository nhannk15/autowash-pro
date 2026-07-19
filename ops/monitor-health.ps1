param(
    [string]$BaseUrl = "http://localhost",
    [string]$BackendUrl = "http://localhost:8080",
    [int]$IntervalSeconds = 60,
    [string]$LogFile = "logs/health-monitor.log"
)

$ErrorActionPreference = "Stop"

New-Item -ItemType Directory -Force -Path (Split-Path $LogFile) | Out-Null

while ($true) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    try {
        & "$PSScriptRoot/health-check.ps1" -BaseUrl $BaseUrl -BackendUrl $BackendUrl | Out-Null
        "$timestamp OK" | Tee-Object -FilePath $LogFile -Append
    } catch {
        "$timestamp FAIL $($_.Exception.Message)" | Tee-Object -FilePath $LogFile -Append
    }
    Start-Sleep -Seconds $IntervalSeconds
}
