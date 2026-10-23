# 19 — Disbursement Flow

## Pre-disbursement checklist
Configured mandatory items may include:
- approved application
- accepted active offer
- verified documents
- required KFS/agreement completed
- customer confirmations complete
- applicable payment verified
- bank details verified
- approval conditions satisfied

## Lifecycle
Ready → Initiated → Processing → Disbursed.
Failure: Processing → Failed → Action Required → Authorized Retry.

## Record
amount, deductions, net amount, bank/destination reference, provider reference, initiated_by, initiated_at, status, completed_at, failure reason.

## Rules
- customer cannot mark disbursed
- staff cannot bypass prerequisites except through explicit authorized override if business allows
- retry must not duplicate transfer
- success must be auditable
