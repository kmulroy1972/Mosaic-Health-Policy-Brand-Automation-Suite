param(
  [Parameter(Mandatory = $true)] [ValidateSet('dev','test','prod')] [string] $Environment,
  [Parameter(Mandatory = $true)] [string] $ResourceGroup,
  [Parameter(Mandatory = $true)] [string] $StaticSiteName,
  [Parameter(Mandatory = $true)] [string] $FunctionsApp,
  [Parameter(Mandatory = $true)] [string] $StorageAccount
)

$ErrorActionPreference = 'Stop'

Write-Host "[deploy] Packaging manifests for $Environment"
pnpm ts-node scripts/deployment/package-manifests.ts $Environment

Write-Host "[deploy] Packaging task panes"
pnpm ts-node scripts/deployment/package-taskpanes.ts

$artifactRoot = Join-Path (Get-Location) "artifacts"
$manifestPath = Join-Path $artifactRoot "$Environment\manifest-unified-$Environment.json"

if (-not (Test-Path $manifestPath)) {
  throw "Manifest not found at $manifestPath"
}

Write-Host "[deploy] Uploading task panes to storage"
$taskpaneDir = Join-Path $artifactRoot 'word'
Get-ChildItem $taskpaneDir -Filter '*.zip' | ForEach-Object {
  az storage blob upload `
    --account-name $StorageAccount `
    --container-name "taskpanes" `
    --file $_.FullName `
    --name "${Environment}/$($_.Name)" `
    --overwrite true | Out-Null
}

Write-Host "[deploy] Deploying Functions"
az functionapp deployment source config-zip `
  --name $FunctionsApp `
  --resource-group $ResourceGroup `
  --src "$artifactRoot/backend-functions-$Environment.zip"

Write-Host "[deploy] Uploading manifest artifact"
az storage blob upload `
  --account-name $StorageAccount `
  --container-name "manifests" `
  --file $manifestPath `
  --name "${Environment}/manifest-unified-$Environment.json" `
  --overwrite true | Out-Null

Write-Host "[deploy] Completed $Environment deployment"
