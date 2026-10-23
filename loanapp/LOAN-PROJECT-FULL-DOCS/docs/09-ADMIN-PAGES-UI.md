# 09 — Admin Pages and UI

## Required pages
- Admin Login
- Dashboard
- Applications
- Application Detail
- Verification Queue
- Assessment Queue
- Approval Queue
- Offers
- Payments
- Disbursements
- Customers
- Loan Categories
- Loan Products
- Admin Users
- Roles & Permissions
- Reports
- Audit Logs
- Settings

## Admin shell
Desktop-first sidebar + top bar + content area.

## Applications table
Suggested columns:
Application No, Customer, Product, Requested Amount, Status, Assigned To, Submitted At, Updated At, Pending Action.

## Application detail tabs/sections
Overview, Customer, Application, Employment/Business, Financials, Banking, Documents, Verification, Assessment, Decision, Offer, Formalities, Payment, Disbursement, Internal Notes, Communications, Audit Timeline.

## UX rules
- protected actions need confirmation
- irreversible actions need stronger confirmation
- button visibility follows permissions, but backend authorization is mandatory
- complex review uses full page rather than cramped modal
