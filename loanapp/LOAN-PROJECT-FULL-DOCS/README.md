# Digital Loan Management Platform — Complete Documentation Pack

This package is intended to be placed in the root of the project and given to Antigravity as the project source of truth.

## Product structure

- Customer: React mobile-first customer portal.
- Android: native Android app shell hosting the customer portal and providing native integrations.
- Admin: React web administration panel.
- Backend: Laravel API and central business rules.

## Start

Read these first:

1. `docs/00-MASTER-INSTRUCTIONS.md`
2. `docs/01-PRODUCT-PRD.md`
3. `docs/02-PROJECT-SCOPE.md`
4. `docs/35-IMPLEMENTATION-ORDER.md`
5. `docs/44-ANTIGRAVITY-BUILD-PROMPT.md`

Do not treat the Android app as a second independent implementation of the loan business flow. Laravel remains the authority for protected workflow decisions.
