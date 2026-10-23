# 44 — Antigravity Build Prompt

Use this from the repository root.

You are implementing the Digital Loan Management Platform. The `/docs` folder is the source of truth.

Before any code change:
1. Read `docs/00-MASTER-INSTRUCTIONS.md`.
2. Read `docs/01-PRODUCT-PRD.md`.
3. Read `docs/02-PROJECT-SCOPE.md`.
4. Read `docs/03-USER-ROLES-PERMISSIONS.md`.
5. Read `docs/06-LOAN-STATUS-FLOW.md`.
6. Read `docs/21-DATABASE-DESIGN.md`.
7. Read `docs/22-API-CONTRACT.md`.
8. Read `docs/23-AUTH-SECURITY.md`.
9. Read `docs/29-CODING-STANDARDS.md`.
10. Read `docs/35-IMPLEMENTATION-ORDER.md`.
11. Inspect all existing code.
12. Update `docs/42-PROGRESS.md` with existing and missing work.

Architecture:
- Customer: React mobile-first.
- Admin: React web.
- Backend: Laravel.
- Android: native shell hosting the customer React experience with required native integrations.
- Laravel is the authority for protected business logic and workflow state.

Work phase-by-phase using `docs/35-IMPLEMENTATION-ORDER.md`.

For every phase:
- read relevant docs
- inspect current code
- reuse correct existing code
- implement missing pieces
- add/update migrations safely
- add backend validation/authorization
- integrate frontend
- add tests
- run tests/build/lint
- fix introduced issues
- verify acceptance criteria
- update changelog/progress/known issues

Restrictions:
- do not invent loan statuses
- do not let frontend force protected status
- do not hardcode secrets
- do not expose internal notes/private documents
- do not trust frontend payment success
- do not bypass disbursement prerequisites
- do not duplicate central business logic in Android
- do not expose browser chrome/raw WebView errors
- do not invent legal/KFS/agreement wording

If an external provider credential is unavailable, implement the provider abstraction/configuration and mock/test path, document the blocker, and continue other work.

Do not mark the project complete until end-to-end customer/admin flow, Android integration, critical tests and final QA pass.
