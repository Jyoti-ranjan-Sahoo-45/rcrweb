# 23 — Authentication and Security

## Authentication
Use a Laravel-supported approach appropriate to React SPA/API and Android-hosted customer experience. Do not invent a separate Android identity system.

## Requirements
- secure login/logout
- session/token expiry
- account recovery
- rate limiting/brute-force controls
- secure cookies/tokens where applicable
- HTTPS outside local development
- CSRF protection where architecture requires it

## Authorization
Each protected endpoint verifies identity, ownership/permission, current application state and business prerequisites.

## Sensitive data
- minimize collection
- redact secrets/sensitive data in logs
- private document storage
- restricted production access
- encrypted transport
- backup protection

## Android WebView
- trusted-origin allowlist
- TLS errors never ignored
- minimal bridge
- validate bridge payloads
- disable debug mode in production
- no unrestricted local file access

## Admin
Strong authentication, session timeout, permission checks and auditable critical actions. MFA should be configurable if required.
