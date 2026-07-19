param(
    [string]$BaseUrl = "http://localhost",
    [string]$BackendUrl = "http://localhost:8080"
)

$ErrorActionPreference = "Stop"

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [int]$ExpectedStatus = 200
    )

    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -ne $ExpectedStatus) {
            throw "$Name returned HTTP $($response.StatusCode), expected $ExpectedStatus"
        }
        Write-Host "OK $Name $Url"
    } catch {
        throw "Health check failed for $Name ($Url): $($_.Exception.Message)"
    }
}

Test-Endpoint -Name "frontend" -Url $BaseUrl
Test-Endpoint -Name "backend-actuator" -Url "$BackendUrl/actuator/health"
Test-Endpoint -Name "swagger" -Url "$BackendUrl/swagger-ui/index.html"

docker compose ps
