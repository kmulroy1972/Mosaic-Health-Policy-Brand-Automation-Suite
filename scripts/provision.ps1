param(
    [Parameter(Mandatory = $true)] [string] $TenantId,
    [Parameter(Mandatory = $true)] [string] $CdnHost,
    [Parameter(Mandatory = $true)] [string] $KeyVaultName,
    [Parameter(Mandatory = $true)] [string] $KeyVaultResourceGroup,
    [Parameter()] [string] $KeyVaultSecretName = 'mhp-backend-client-secret',
    [Parameter()] [string] $BackendSecretValue,
    [Parameter()] [string] $Environment = 'dev'
)

$ErrorActionPreference = 'Stop'

function New-RandomSecret {
    param([int] $Length = 48)
    $provider = New-Object System.Security.Cryptography.RNGCryptoServiceProvider
    $bytes = New-Object byte[] ($Length)
    $provider.GetBytes($bytes)
    return [Convert]::ToBase64String($bytes)
}

if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
    throw 'Azure CLI (az) is required to run this script.'
}

if (-not (Get-Module -ListAvailable -Name Az.Accounts)) {
    Write-Warning 'Az PowerShell module not detected. Continuing with Azure CLI only.'
}

$effectiveSecret = if ([string]::IsNullOrEmpty($BackendSecretValue)) { New-RandomSecret } else { $BackendSecretValue }

$deploymentName = "mhp-entra-$(Get-Date -Format 'yyyyMMddHHmmss')"

$deploymentArgs = @(
    'deployment', 'tenant', 'create',
    '--name', $deploymentName,
    '--template-file', 'bicep/entra/apps.bicep',
    '--parameters', "tenantId=$TenantId",
    '--parameters', "cdnHost=$CdnHost",
    '--parameters', "keyVaultName=$KeyVaultName",
    '--parameters', "keyVaultResourceGroup=$KeyVaultResourceGroup",
    '--parameters', "keyVaultSecretName=$KeyVaultSecretName",
    '--parameters', "backendClientSecret=$effectiveSecret"
)

Write-Host "Executing Bicep deployment: $deploymentName" -ForegroundColor Cyan
$deploymentResult = az @deploymentArgs | ConvertFrom-Json

if (-not $deploymentResult.properties.outputs) {
    throw 'Deployment completed without outputs. Check azure cli logs for details.'
}

$spaClientId = $deploymentResult.properties.outputs.spaClientId.value
$backendClientId = $deploymentResult.properties.outputs.backendClientId.value
$backendServicePrincipalId = $deploymentResult.properties.outputs.backendServicePrincipalId.value

$envDirectory = Join-Path -Path (Get-Location) -ChildPath 'env'
if (-not (Test-Path $envDirectory)) {
    New-Item -ItemType Directory -Path $envDirectory | Out-Null
}

$envFile = Join-Path -Path $envDirectory -ChildPath "$Environment.json"

$envContent = [ordered]@{
    tenantId = $TenantId
    spaClientId = $spaClientId
    confidentialClientId = $backendClientId
    backendServicePrincipalId = $backendServicePrincipalId
    keyVaultName = $KeyVaultName
    keyVaultSecretName = $KeyVaultSecretName
    note = 'Client secret is stored in Key Vault; retrieve via az keyvault secret show.'
}

$envJson = $envContent | ConvertTo-Json -Depth 4
$envJson | Set-Content -Path $envFile -Encoding UTF8

Write-Host "Environment outputs written to $envFile" -ForegroundColor Green
