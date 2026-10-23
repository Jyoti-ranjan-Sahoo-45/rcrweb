# 27 — Error Handling

## Never show customers
stack traces, SQL errors, framework exception pages, raw provider payloads, raw WebView errors.

## Customer states
validation error, session expired, unauthorized, no internet, server unavailable, upload failed, invalid file, payment pending/failed, offer expired, invalid workflow state, download failed.

Each error should show a safe next action.

## Admin
Display concise action failure and safe retry guidance. Show conflict message on concurrent changes.

## Backend codes
VALIDATION_ERROR, UNAUTHENTICATED, FORBIDDEN, APPLICATION_STATE_CONFLICT, DOCUMENT_NOT_ALLOWED, OFFER_EXPIRED, PAYMENT_NOT_VERIFIED, PRE_DISBURSEMENT_INCOMPLETE.

Technical details stay in protected logs.
