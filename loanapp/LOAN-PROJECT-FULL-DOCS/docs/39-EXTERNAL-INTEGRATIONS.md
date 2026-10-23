# 39 — External Integrations

## Possible integrations
- payment gateway
- push notification provider
- email
- SMS
- WhatsApp
- e-sign/document signing
- KYC/identity provider
- credit bureau
- bank/disbursement provider
- object storage

## Integration rule
Wrap providers behind project services/interfaces so a provider can be replaced without rewriting loan workflow.

## For each provider document
- purpose
- credentials/config
- request/response mapping
- webhook/callback verification
- timeout
- retry
- idempotency
- failure states
- logging/redaction
- sandbox vs production

If credentials are missing, build the abstraction and safe mock/test path, record blocker, and continue.
