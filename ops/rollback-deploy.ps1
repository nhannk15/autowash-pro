param(
    [Parameter(Mandatory = $true)]
    [string]$BackendTag,
    [Parameter(Mandatory = $true)]
    [string]$FrontendTag,
    [string]$ImageRepository = "761990338651.dkr.ecr.ap-northeast-2.amazonaws.com/autowash-pro",
    [string]$EnvFile = ".env",
    [string]$ComposeFile = "docker-compose.yml",
    [switch]$SkipBackup
)

$ErrorActionPreference = "Stop"

if (-not $SkipBackup) {
    & "$PSScriptRoot/backup-db.ps1" -EnvFile $EnvFile -ComposeFile $ComposeFile
}

Write-Host "Rolling back images to backend-$BackendTag and frontend-$FrontendTag..."
$env:BACKEND_IMAGE = "$ImageRepository`:backend-$BackendTag"
$env:FRONTEND_IMAGE = "$ImageRepository`:frontend-$FrontendTag"
docker compose --env-file $EnvFile -f $ComposeFile pull backend frontend
docker compose --env-file $EnvFile -f $ComposeFile up -d backend frontend
& "$PSScriptRoot/health-check.ps1"
