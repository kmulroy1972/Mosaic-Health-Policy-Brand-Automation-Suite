# Assumptions

- MHP brand kit is complete, governed externally, and remains immutable within this project.
- Official templates are stored in the SharePoint Organizational Assets library and are always reachable by the service accounts.
- Entra ID Nested App Authentication (NAA) is available for Office add-ins; OAuth On-Behalf-Of is the fallback when NAA is unavailable.
- Required Azure resources (tenant, Key Vault, App Configuration, Application Insights, Azure Functions, Azure OpenAI in an approved region) already exist and can be referenced by configuration.
- Protected health information (PHI) and personally identifiable information (PII) never leave Azure boundaries; telemetry is scrubbed of PHI/PII before emission.
- PDF/UA tagging is preserved primarily through in-application export workflows; optional PDF/A-2b conversion happens server-side only when explicitly requested.
- Brand enforcement applies existing assets and styles without modifying original brand files or templates.
