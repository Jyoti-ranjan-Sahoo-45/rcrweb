# 24 — Audit Log

## Critical actions
assignment, document verify/reject, information request, assessment update, approval/rejection, offer create/change/issue, payment verification, disbursement changes, product configuration, user/permission changes.

## Fields
actor_type, actor_id, action, entity_type, entity_id, old_values when appropriate, new_values when appropriate, redacted metadata, IP/device context if policy allows, created_at.

## Rules
- not editable through ordinary UI
- no binary file contents
- redact secrets and high-risk identifiers
- searchable by actor/action/entity/date
- application timeline may show a customer-safe subset, never raw internal audit data
