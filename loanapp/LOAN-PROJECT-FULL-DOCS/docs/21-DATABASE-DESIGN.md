# 21 — Database Design

## Core tables/entities
- users/customers
- admin_users or unified users
- roles
- permissions
- role_permission
- user_role
- loan_categories
- loan_products
- loan_product_versions/configuration
- product_document_requirements
- product_eligibility_rules
- loan_applications
- application_personal_details
- application_employment_details
- application_business_details
- application_financial_details
- application_bank_details
- application_documents
- document_versions
- information_requests
- assessments
- decisions
- loan_offers
- formalities/agreement_records
- payment_records
- disbursement_records
- notifications
- internal_notes
- application_status_history
- audit_logs

## Application key fields
id, application_number, customer_id, product_id/version reference, requested amount/tenure, current_status, assigned_to, submitted_at, timestamps.

## Document key fields
application_id, type, current_version_id, status, verifier, verification time, customer-visible reason.

## Data rules
- foreign keys
- index application number
- index common queue/search fields
- decimal types for money
- consistent timestamps
- immutable history for decisions/offers/payment/disbursement where practical
- avoid uncontrolled JSON for highly queryable core data
- do not cascade-delete critical financial/audit history accidentally
