# Microsoft Graph Scopes

The suite adheres to least-privilege access across all Office hosts. Scopes are requested via Entra ID Nested App Authentication (NAA) when available, with OAuth On-Behalf-Of (OBO) as fallback for backend operations.

| Scope             | Required By                   | Usage                                                                                      | Notes                                                                       |
| ----------------- | ----------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| `User.Read`       | All add-ins                   | Establish signed-in user context, display profile info in UI, and verify tenant alignment. | Baseline scope for Office SSO; no content access.                           |
| `Files.Read`      | Word, PowerPoint              | Read document metadata and templates when applying brand locally.                          | Always granted; used for read-only operations.                              |
| `Files.ReadWrite` | Word, PowerPoint              | Save branded documents or export artifacts when in-app APIs require delegated write.       | Requested only when user explicitly performs save/export requiring Graph.   |
| `Sites.Read.All`  | Templates service             | Enumerate SharePoint Org Assets library to list official templates.                        | App-only via Graph Proxy; restricted to Organizational Assets site.         |
| `offline_access`  | Outlook On-send (server side) | Maintain refresh tokens for background delta sync or queued policy evaluations.            | Only issued to confidential client; ensures compliance with retry policies. |

Additional controls:

- Scopes are consented per host environment (dev/test/prod) to prevent over-granting.
- If `Files.ReadWrite` is not consented, the UI degrades gracefully to read-only previews.
- No wildcard `Sites.ReadWrite.All` or mail-scoped permissions are used; mail content stays within Outlook client context.

PHI/PII Handling:

- Word/PowerPoint operations perform local processing where possible; Graph uploads occur only for user-initiated exports.
- Outlook On-send inspects body content in-memory; only sanitized policy results are stored server-side. Refresh tokens are stored in Key Vault-backed secrets within Azure, never in client storage.
