# 30 — Frontend Architecture

## Suggested structure
frontend/src/
- app
- routes
- layouts
- pages/customer
- pages/admin
- components/common
- components/customer
- components/admin
- features/auth
- features/catalog
- features/applications
- features/documents
- features/offers
- features/payments
- features/disbursements
- features/notifications
- services/api
- hooks
- state
- utils
- types
- styles

## Separation
Customer uses mobile-first app shell. Admin uses desktop operational shell. Share only truly reusable components/services.

## Server state
Backend remains authoritative; do not keep permanent workflow truth only in frontend state.

## API client
Centralize base URL, auth/session handling, error normalization, environment config and request cancellation.
