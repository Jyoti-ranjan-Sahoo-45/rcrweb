# 29 — Coding Standards

## General
Readable, modular, tested code. No hardcoded secrets. No silent TODO for critical workflow.

## React
- prefer TypeScript for new code
- reusable components
- central API client
- feature-based organization
- route guards
- centralized validation schemas
- loading/error/empty states
- design tokens
- avoid huge page components

## Laravel
- Form Request validation
- Policies/Gates/permissions
- service/action classes for workflow
- DB transactions for critical multi-record operations
- events/jobs for async notifications where appropriate
- API resources/transformers
- enums/constants for statuses
- tests for transitions and permissions

## Git
Small logical commits; never commit `.env` or secrets.
