@description('Tenant where the apps are registered.')
param tenantId string

@description('Display name for the SPA app registration.')
param spaDisplayName string = 'MHP Brand Automation SPA'

@description('Display name for the confidential backend app registration.')
param backendDisplayName string = 'MHP Brand Automation Backend'

@description('Hostname of the CDN serving static assets (e.g. cdn.contoso.com).')
param cdnHost string

@description('Redirect URIs for the backend Azure Functions app.')
param backendRedirectUris array = [
  'https://localhost:7071/.auth/login/aad/callback'
]

@description('Existing Key Vault name that stores the backend client secret.')
param keyVaultName string

@description('Resource group containing the Key Vault.')
param keyVaultResourceGroup string

@description('Secret name to write the backend client secret under.')
param keyVaultSecretName string = 'mhp-backend-client-secret'

@secure()
@description('Client secret value for the confidential backend app.')
param backendClientSecret string

var graphResourceId = '00000003-0000-0000-c000-000000000000'
var delegatedScopes = [
  {
    id: 'e1fe6dd8-ba31-4d61-89e7-88639da4683d' // User.Read
    type: 'Scope'
  }
  {
    id: '10465720-29dd-4523-a11a-6a75c743c9d9' // Files.Read
    type: 'Scope'
  }
  {
    id: '863451e7-0667-486c-a5d6-d135439485f0' // Files.ReadWrite
    type: 'Scope'
  }
  {
    id: 'c7f6b05a-071c-49e8-a7cd-02d1405bd9ff' // Sites.Read.All
    type: 'Scope'
  }
  {
    id: 'df021288-bdef-4463-88db-98f22de89214' // offline_access
    type: 'Scope'
  }
]

var spaRedirectUris = [
  'https://localhost:3000'
  'https://' + cdnHost + '/assets'
]

resource spaApp 'Microsoft.Graph/applications@1.0' = {
  displayName: spaDisplayName
  signInAudience: 'AzureADMyOrg'
  web: {
    implicitGrantSettings: {
      enableAccessTokenIssuance: false
      enableIdTokenIssuance: true
    }
  }
  spa: {
    redirectUris: spaRedirectUris
  }
  requiredResourceAccess: [
    {
      resourceAppId: graphResourceId
      resourceAccess: delegatedScopes
    }
  ]
}

resource spaServicePrincipal 'Microsoft.Graph/servicePrincipals@1.0' = {
  appId: spaApp.appId
}

resource backendApp 'Microsoft.Graph/applications@1.0' = {
  displayName: backendDisplayName
  signInAudience: 'AzureADMyOrg'
  web: {
    redirectUris: backendRedirectUris
    implicitGrantSettings: {
      enableAccessTokenIssuance: false
      enableIdTokenIssuance: false
    }
  }
  api: {
    requestedAccessTokenVersion: 2
  }
  requiredResourceAccess: [
    {
      resourceAppId: graphResourceId
      resourceAccess: delegatedScopes
    }
  ]
  passwordCredentials: [
    {
      displayName: 'FunctionApp Client Secret'
      endDateTime: dateTimeAdd(utcNow(), 'P1Y')
      secretText: backendClientSecret
    }
  ]
}

resource backendServicePrincipal 'Microsoft.Graph/servicePrincipals@1.0' = {
  appId: backendApp.appId
}

resource keyVault 'Microsoft.KeyVault/vaults@2023-02-01' existing = {
  name: keyVaultName
  scope: resourceGroup(keyVaultResourceGroup)
}

resource backendSecret 'Microsoft.KeyVault/vaults/secrets@2023-02-01' = {
  name: '${keyVault.name}/${keyVaultSecretName}'
  properties: {
    value: backendClientSecret
  }
}

output spaClientId string = spaApp.appId
output backendClientId string = backendApp.appId
output backendServicePrincipalId string = backendServicePrincipal.id
output targetTenant string = tenantId
