# 16 — Loan Offer

## Prerequisites
Application approved and actor authorized.

## Fields
offer_number, application_number, approved_amount, rate/ROI information, tenure, EMI, processing fee, taxes, other applicable charges, repayment disclosures where required, conditions, valid_until, template/document reference.

## States
draft, issued, accepted, declined, expired, superseded.

## Rules
- only active issued offer can be accepted
- expired offer cannot be accepted
- material modifications create a new/superseding version
- store issuance and acceptance timestamps
- customer must be able to identify exact offer version accepted
- fees/charges must be visible

## Customer actions
Accept or Decline. Decline reason may be optional unless business policy requires it.
