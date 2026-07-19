param(
    [string]$EnvFile = ".env"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $EnvFile)) {
    throw "Missing env file: $EnvFile. Copy .env.example to .env and fill real values."
}

$required = @(
    "MYSQL_ROOT_PASSWORD",
    "MYSQL_DATABASE",
    "MYSQL_USER",
    "MYSQL_PASSWORD",
    "SPRING_DATASOURCE_URL",
    "SPRING_DATASOURCE_USERNAME",
    "SPRING_DATASOURCE_PASSWORD",
    "SPRING_JPA_HIBERNATE_DDL_AUTO",
    "JWT_SECRET_KEY",
    "FRONTEND_BASE_URL",
    "SPRING_MAIL_HOST",
    "SPRING_MAIL_PORT",
    "SPRING_MAIL_USERNAME",
    "SPRING_MAIL_PASSWORD",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "VNPAY_TMN_CODE",
    "VNPAY_HASH_SECRET",
    "VNPAY_RETURN_URL",
    "VNPAY_IPN_URL"
)

$values = @{}
Get-Content $EnvFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -eq "" -or $line.StartsWith("#") -or -not $line.Contains("=")) { return }
    $key, $value = $line.Split("=", 2)
    $values[$key.Trim()] = $value.Trim().Trim('"').Trim("'")
}

$errors = New-Object System.Collections.Generic.List[string]
foreach ($key in $required) {
    if (-not $values.ContainsKey($key) -or [string]::IsNullOrWhiteSpace($values[$key]) -or $values[$key] -like "change-me*") {
        $errors.Add("Missing or placeholder value: $key")
    }
}

if ($values["SPRING_DATASOURCE_URL"] -match "3306/([^?]+)") {
    $jdbcDatabase = $Matches[1]
    if ($values["MYSQL_DATABASE"] -and $values["MYSQL_DATABASE"] -ne $jdbcDatabase) {
        $errors.Add("MYSQL_DATABASE '$($values["MYSQL_DATABASE"])' does not match SPRING_DATASOURCE_URL database '$jdbcDatabase'.")
    }
}

if ($values["SPRING_DATASOURCE_USERNAME"] -ne $values["MYSQL_USER"]) {
    $errors.Add("SPRING_DATASOURCE_USERNAME must match MYSQL_USER for the compose database user.")
}

if ($values["SPRING_DATASOURCE_PASSWORD"] -ne $values["MYSQL_PASSWORD"]) {
    $errors.Add("SPRING_DATASOURCE_PASSWORD must match MYSQL_PASSWORD.")
}

if ($values["SPRING_JPA_HIBERNATE_DDL_AUTO"] -notin @("validate", "none", "update")) {
    $errors.Add("SPRING_JPA_HIBERNATE_DDL_AUTO should be validate/none in production, update only for local demo.")
}

if ($values["JWT_SECRET_KEY"] -and $values["JWT_SECRET_KEY"].Length -lt 64) {
    $errors.Add("JWT_SECRET_KEY should be at least 64 characters.")
}

if ($errors.Count -gt 0) {
    $errors | ForEach-Object { Write-Error $_ }
    throw "Environment validation failed."
}

Write-Host "Environment validation passed: $EnvFile"
