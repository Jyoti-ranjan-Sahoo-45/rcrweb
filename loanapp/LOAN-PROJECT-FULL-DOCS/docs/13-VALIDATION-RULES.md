# 13 — Validation Rules

## Server authority
Laravel validation is mandatory. Client validation is UX assistance only.

## General
- trim input
- reject invalid required values
- enforce reasonable max lengths
- normalize mobile/email formats
- use decimal-safe money types
- enforce product amount/tenure limits
- validate real dates and date relationships
- sanitize uploads

## Document validation
- allowed MIME types
- allowed extensions
- max size
- deny executable types
- optional scanning integration
- do not trust extension alone

## Conditional examples
- business fields for business applicants
- employment fields for salaried applicants
- rejection reason for rejection
- document rejection reason for rejected file
- payment fields only when payment applies

## Workflow action validation
Every protected action checks:
- current status
- requested transition
- permission
- prerequisites
- required reason/comment
- concurrency/idempotency where applicable
