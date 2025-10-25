# Nested App Authentication & Office SSO Configuration

## Office Add-in Manifest Snippet (NAA)
```jsonc
{
  "Authorization": {
    "Permissions": [
      {
        "Resource": "Microsoft Graph",
        "Scopes": [
          "User.Read",
          "Files.Read",
          "Files.ReadWrite",
          "Sites.Read.All"
        ]
      }
    ],
    "CertificateReferences": [
      {
        "Id": "${backendClientId}",
        "PublicCertificate": "<base64-encoded-cert>"
      }
    ]
  },
  "WebApplicationInfo": {
    "Id": "${spaClientId}",
    "Resource": "api://${backendClientId}",
    "Scopes": [
      "access_as_user"
    ]
  }
}
```
- NAA pairs the frontend (SPA) client ID with the confidential backend resource (`api://${backendClientId}`) to exchange tokens without redirecting users outside Office.
- Each environment maintains its own certificate; rotations update the `CertificateReferences` section only.

## Office Runtime SSO Section
```jsonc
{
  "SupportsSharedFolders": true,
  "SupportsAddInCommands": true,
  "Runtime": {
    "Override": true,
    "Callable": [
      {
        "Method": "getAccessToken",
        "Options": {
          "AllowSignInPrompt": false,
          "ForceConsentPrompt": false,
          "Authority": "https://login.microsoftonline.com/${tenantId}",
          "ClientId": "${spaClientId}",
          "Resource": "api://${backendClientId}",
          "Scopes": [
            "User.Read",
            "Files.Read",
            "Files.ReadWrite"
          ]
        }
      }
    ]
  }
}
```
- `AllowSignInPrompt` remains `false` to avoid unexpected UI; add-ins fall back to OBO if the token acquisition fails.
- `Resource` aligns with the backend app registration, enabling the runtime to mint tokens accepted by Azure Functions.
- Additional scopes (e.g., `Sites.Read.All`) are requested via the backend OBO flow to limit exposure in the client runtime.

## Token Flow Summary
1. Office runtime acquires an access token for the SPA registration using NAA. The token includes delegated scopes for Microsoft Graph.
2. The SPA exchanges this token with the backend via an HTTPS call, presenting it in the `Authorization` header.
3. The backend performs an On-Behalf-Of (OBO) exchange with Azure AD to obtain a new token for Microsoft Graph or other downstream APIs.
4. Refresh tokens are stored only within Azure (Key Vault); add-ins never persist tokens locally beyond the Office runtime cache.
