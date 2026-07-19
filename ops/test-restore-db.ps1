param(
    [Parameter(Mandatory = $true)]
    [string]$BackupFile,
    [string]$EnvFile = ".env",
    [string]$ComposeFile = "docker-compose.yml",
    [string]$Service = "mysql",
    [string]$TestDatabase = "autowash_restore_test"
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
$rootPassword = $envValues["MYSQL_ROOT_PASSWORD"]

Write-Host "Creating isolated restore test database '$TestDatabase'..."
docker compose --env-file $EnvFile -f $ComposeFile exec -T $Service mariadb `
    -u root `
    "-p$rootPassword" `
    -e "DROP DATABASE IF EXISTS ``$TestDatabase``; CREATE DATABASE ``$TestDatabase`` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

Get-Content $BackupFile | docker compose --env-file $EnvFile -f $ComposeFile exec -T $Service mariadb `
    -u root `
    "-p$rootPassword" `
    $TestDatabase

$tableCount = docker compose --env-file $EnvFile -f $ComposeFile exec -T $Service mariadb `
    -N `
    -u root `
    "-p$rootPassword" `
    -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$TestDatabase';"

Write-Host "Restore test passed. Table count: $tableCount"
docker compose --env-file $EnvFile -f $ComposeFile exec -T $Service mariadb `
    -u root `
    "-p$rootPassword" `
    -e "DROP DATABASE IF EXISTS ``$TestDatabase``;"
