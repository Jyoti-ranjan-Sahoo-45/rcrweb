# 42 — Antigravity Build Prompt

Copy the prompt below into Antigravity from the repository root.

---

You are responsible for implementing this Digital Loan Management Platform.

The `/docs` directory is the source of truth.

## Mandatory first steps

Before making any code change:

1. Read `/docs/00-MASTER-INSTRUCTIONS.md`.
2. Read `/docs/01-PRODUCT-PRD.md`.
3. Read `/docs/02-PROJECT-SCOPE.md`.
4. Read `/docs/03-USER-ROLES-PERMISSIONS.md`.
5. Read `/docs/06-LOAN-STATUS-FLOW.md`.
6. Read `/docs/20-DATABASE-DESIGN.md`.
7. Read `/docs/21-API-CONTRACT.md`.
8. Read `/docs/22-AUTH-SECURITY.md`.
9. Read `/docs/28-CODING-STANDARDS.md`.
10. Read `/docs/35-IMPLEMENTATION-ORDER.md`.
11. Inspect the complete existing repository before changing anything.
12. Update `/docs/39-PROGRESS.md` with what already exists and what is missing.

## Architecture that must be preserved

- Customer frontend: React, mobile-first.
- Customer experience must work in mobile browser and inside the Android application.
- Admin panel: React web application.
- Backend: Laravel.
- Android: native Android app shell around the customer React experience, with native integrations where required.
- Laravel is the single authority for business rules and protected state transitions.
- Do not duplicate backend business logic inside Android.

## How to work

Follow `/docs/35-IMPLEMENTATION-ORDER.md`.

For each phase:

1. Read every relevant documentation file.
2. Inspect existing implementation.
3. Reuse correct existing code instead of rewriting it unnecessarily.
4. Implement missing pieces.
5. Add or update migrations safely.
6. Implement backend authorization and validation.
7. Implement frontend UI and API integration.
8. Add automated tests for critical paths.
9. Run tests/build/lint appropriate to the repository.
10. Fix errors caused by the work.
11. Check `/docs/34-ACCEPTANCE-CRITERIA.md`.
12. Update `/docs/38-CHANGELOG.md`.
13. Update `/docs/39-PROGRESS.md`.
14. Add unresolved issues to `/docs/40-KNOWN-ISSUES.md`.

## Important restrictions

- Do not invent undocumented loan workflow states.
- Do not directly set protected status from frontend.
- Do not hardcode secrets.
- Do not expose internal notes to customer APIs.
- Do not expose private documents publicly.
- Do not mark payment successful only because the frontend returns from a payment page.
- Do not mark a loan disbursed unless backend pre-disbursement checks pass.
- Do not bypass permission checks.
- Do not create a separate duplicate customer business implementation in Android.
- Do not show browser chrome or raw WebView error screens in the Android customer app.
- Do not invent legal/KFS/agreement wording. Use configurable approved templates/placeholders.

## Stop condition

Continue phase by phase until all implementation work that can be completed from these requirements is complete.

Only mark the project DONE when:

- acceptance criteria pass
- critical tests pass
- customer flow works end to end
- admin flow works end to end
- Android shell works for customer flow
- no blocking issue remains undocumented

If an external credential/provider is unavailable, implement the integration boundary, mock/test mode and configuration structure, document the exact blocker in `40-KNOWN-ISSUES.md`, then continue with other work instead of stopping the whole project.
