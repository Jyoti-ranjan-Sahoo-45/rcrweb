# 31 — Backend Architecture

## Laravel domains
Auth, Customers, LoanCatalog, Eligibility, Applications, Documents, InformationRequests, Assessments, Decisions, Offers, Formalities, Payments, Disbursements, Notifications, Reporting, Administration, Audit.

## Layer responsibilities
Controllers: HTTP boundary.
Requests: validation.
Policies: authorization.
Services/Actions: business operation.
Models: persistence/relations.
Resources: response formatting.
Events/Jobs: suitable async tasks.

## Critical transactions
application submission, decision + status history, offer issue, payment verification state change, disbursement state change.

## Status rule
Centralize allowed transitions. Do not scatter arbitrary status assignments across controllers.
