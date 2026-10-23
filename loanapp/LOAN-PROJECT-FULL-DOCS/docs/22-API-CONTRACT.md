# 22 — API Contract

## Base
`/api/v1`

## Standard success
```json
{"success":true,"message":"...","data":{}}
```

## Standard error
```json
{"success":false,"message":"Validation failed","errors":{"field":["..."]},"code":"VALIDATION_ERROR"}
```

## Customer endpoints

### Auth
POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/forgot
POST /auth/reset
GET /me

### Catalog
GET /loan-categories
GET /loan-products
GET /loan-products/{id}
POST /loan-products/{id}/eligibility-check

### Applications
GET /applications
POST /applications
GET /applications/{id}
PATCH /applications/{id}/draft
POST /applications/{id}/submit
GET /applications/{id}/timeline

### Documents
GET /applications/{id}/documents
POST /applications/{id}/documents
POST /applications/{id}/documents/{document}/replace

### Information requests
GET /applications/{id}/information-requests
POST /applications/{id}/information-requests/{request}/respond

### Offer
GET /applications/{id}/offer
POST /applications/{id}/offer/accept
POST /applications/{id}/offer/decline

### Formalities
GET /applications/{id}/formalities
POST /applications/{id}/formalities/{item}/acknowledge

### Payment
GET /applications/{id}/payments
POST /applications/{id}/payments/{payment}/initiate
GET /payments/{payment}/status

### Disbursement
GET /applications/{id}/disbursement

### Notifications
GET /notifications
POST /notifications/{id}/read

## Admin prefix
`/api/v1/admin`

Required groups: dashboard, applications, assignment, document verify/reject, information request, assessment, approve/reject, offer CRUD/issue, payment verification, disbursement, product management, admin user/permission management, reports, audit.

## Endpoint definition rule
Every endpoint must document authorization, request, validation, response, error codes, status effect and audit behavior.
