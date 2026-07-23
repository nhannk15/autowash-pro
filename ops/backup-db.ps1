param(
    [string]$EnvFile = ".env",
    [string]$BackupDir = "backups",
    [string]$ComposeFile = "docker-compose.yml",
    [string]$Service = "mysql",
    [int]$RetentionDays = 14,
    [int]$MaxBackupFiles = 20
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

if (-not (Test-Path $EnvFile)) {
    throw "Missing env file: $EnvFile"
}

$envValues = Read-DotEnv $EnvFile
$database = $envValues["MYSQL_DATABASE"]
if (-not $database) {
    $url = $envValues["SPRING_DATASOURCE_URL"]
    if ($url -match "3306/([^?]+)") { $database = $Matches[1] }
}
if (-not $database) { throw "MYSQL_DATABASE is required, or provide a database name in SPRING_DATASOURCE_URL." }
if (-not $envValues["MYSQL_USER"] -or -not $envValues["MYSQL_PASSWORD"]) {
    throw "MYSQL_USER and MYSQL_PASSWORD are required in $EnvFile."
}

New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupFile = Join-Path $BackupDir "autowash-$database-$timestamp.sql"

Write-Host "Creating backup for database '$database'..."
docker compose --env-file $EnvFile -f $ComposeFile exec -T $Service mariadb-dump `
    --single-transaction `
    --quick `
    --routines `
    --triggers `
    -u $envValues["MYSQL_USER"] `
    "-p$($envValues["MYSQL_PASSWORD"])" `
    $database | Set-Content -Encoding UTF8 $backupFile

if ((Get-Item $backupFile).Length -lt 100) {
    throw "Backup file is unexpectedly small: $backupFile"
}

Write-Host "Backup saved: $backupFile"

if ($RetentionDays -gt 0) {
    $cutoff = (Get-Date).AddDays(-$RetentionDays)
    Get-ChildItem -Path $BackupDir -Filter "autowash-*.sql" -File |
        Where-Object { $_.LastWriteTime -lt $cutoff } |
        Remove-Item -Force
    Write-Host "Retention cleanup: removed backups older than $RetentionDays days."
}

if ($MaxBackupFiles -gt 0) {
    $oldBackups = Get-ChildItem -Path $BackupDir -Filter "autowash-*.sql" -File |
        Sort-Object LastWriteTime -Descending |
        Select-Object -Skip $MaxBackupFiles
    $oldBackups | Remove-Item -Force
    Write-Host "Retention cleanup: keeping latest $MaxBackupFiles backup files."
}
