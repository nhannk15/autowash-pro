param(
    [Parameter(Mandatory = $true)]
    [string]$BackupFile,
    [string]$EnvFile = ".env",
    [string]$ComposeFile = "docker-compose.yml",
    [string]$Service = "mysql",
    [string]$Database,
    [switch]$Force
)

$ErrorActionPreference = "Stop"

function Read-DotEnv {
    param([string]$Path)
    $values = @{}
    Get-Content $Path | ForEach-Object {
        $line = $_.Trim()
        if ($line -eq "" -or $line.StartsWith("#") -or -not $line.Contains("=")) { return }
        $key, $value = $line.Split("=", 2)
        $values[$key.Trim()] = $value.Trim().Trim('"').Trim("'")
    }
    return $values
}

if (-not (Test-Path $BackupFile)) { throw "Backup file not found: $BackupFile" }
if (-not (Test-Path $EnvFile)) { throw "Missing env file: $EnvFile" }

$envValues = Read-DotEnv $EnvFile
if (-not $Database) {
    $Database = $envValues["MYSQL_DATABASE"]
    if (-not $Database -and $envValues["SPRING_DATASOURCE_URL"] -match "3306/([^?]+)") {
        $Database = $Matches[1]
    }
}
if (-not $Database) { throw "Database target is required." }

if (-not $Force) {
    $answer = Read-Host "Restore '$BackupFile' into '$Database'. Type RESTORE to continue"
    if ($answer -ne "RESTORE") {
        throw "Restore cancelled."
    }
}

Write-Host "Stopping backend/frontend before restore..."
docker compose --env-file $EnvFile -f $ComposeFile stop backend frontend

Write-Host "Dropping and recreating database '$Database'..."
$rootPassword = $envValues["MYSQL_ROOT_PASSWORD"]
docker compose --env-file $EnvFile -f $ComposeFile exec -T $Service mariadb `
    -u root `
    "-p$rootPassword" `
    -e "DROP DATABASE IF EXISTS ``$Database``; CREATE DATABASE ``$Database`` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

Write-Host "Importing backup..."
Get-Content $BackupFile | docker compose --env-file $EnvFile -f $ComposeFile exec -T $Service mariadb `
    -u root `
    "-p$rootPassword" `
    $Database

Write-Host "Starting services..."
docker compose --env-file $EnvFile -f $ComposeFile up -d backend frontend
Write-Host "Restore completed."
