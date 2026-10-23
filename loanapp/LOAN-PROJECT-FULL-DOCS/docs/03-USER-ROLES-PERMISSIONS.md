# 03 — User Roles and Permissions

## Customer
Can manage only own permitted information, applications, documents, offers, payments and disbursement views.
Cannot see internal assessment, internal notes, staff-only documents or other customers.

## Super Admin
Full administrative configuration and access.

## Application Executive
- view permitted applications
- check completeness
- assign/forward if permitted
- request information
- add internal notes

## Verification Executive
- inspect documents
- verify
- reject with reason
- request replacement/additional documents

## Credit Executive
- create assessment
- enter recommendation
- propose amount/tenure/rate/conditions

## Credit Manager / Approver
- review assessment
- approve/reject/return
- operate only within configured authority

## Finance Executive
- view payment records
- verify permitted payments
- handle refund records where enabled

## Operations Executive
- review pre-disbursement checklist
- initiate/update permitted disbursement records
- record provider/bank references

## Manager
- dashboard/reports/queue visibility
- read-only unless additional permissions granted

## Permission examples
- applications.view
- applications.assign
- applications.request_information
- documents.verify
- assessments.create
- decisions.approve
- decisions.reject
- offers.create
- offers.issue
- payments.verify
- disbursements.manage
- products.manage
- users.manage
- reports.view
- audit.view

## Rule
Business code should authorize granular permissions, not only role names.
