# 00 — Master Instructions

## Purpose
These documents are the source of truth for the Digital Loan Management Platform.

## Architecture
- Customer frontend: React, mobile-first.
- Admin frontend: React web admin.
- Backend: Laravel.
- Android: native Android shell around the customer React experience.
- Laravel owns protected business rules and workflow transitions.

## Priority when documents conflict
1. This file.
2. Product PRD.
3. Project scope.
4. Loan status flow.
5. API/database/security documents.
6. Module-specific documents.
7. Existing code only when it does not conflict with the above.

## Mandatory rules
- Never invent undocumented loan statuses.
- Never let the frontend directly force protected application status.
- Never duplicate core loan business rules in Android.
- Validate all customer/admin writes on Laravel.
- Enforce permissions on the backend, not only through hidden UI buttons.
- Keep customer documents private.
- Do not expose internal notes to customers.
- Do not expose stack traces, SQL errors or raw provider responses.
- Do not store secrets in source code or Markdown.
- Record critical workflow changes in audit/status history.
- Payment return in the UI is not proof of payment; backend/provider verification is authoritative.
- Disbursement cannot complete until mandatory pre-disbursement requirements pass.
- Do not invent legal/KFS/agreement wording. Use approved templates/configuration.

## Required workflow for Antigravity
Before coding:
1. Read this file.
2. Read the PRD and scope.
3. Read roles/permissions and status flow.
4. Read architecture/API/database/security docs.
5. Inspect the current repository.
6. Update project progress before implementing.

After each module:
1. Run tests/build/lint.
2. Fix issues caused by the change.
3. Check acceptance criteria.
4. Update changelog.
5. Update progress.
6. Record unresolved items in known issues.

## Completion
Do not mark a module complete unless its acceptance criteria and critical test cases pass.
