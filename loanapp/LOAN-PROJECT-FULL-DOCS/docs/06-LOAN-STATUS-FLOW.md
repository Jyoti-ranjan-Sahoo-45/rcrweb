# 06 — Loan Status Flow

## Internal statuses
- draft
- submitted
- initial_review
- documents_pending
- document_verification
- additional_information_required
- eligibility_review
- credit_assessment
- approval_pending
- approved
- rejected
- offer_preparation
- offer_sent
- offer_accepted
- offer_declined
- offer_expired
- agreement_pending
- payment_pending
- payment_verification
- ready_for_disbursement
- disbursement_processing
- disbursed
- cancelled
- closed

## Main path
draft → submitted → initial_review → document_verification → eligibility_review → credit_assessment → approval_pending → approved → offer_preparation → offer_sent → offer_accepted → agreement_pending → payment_pending/payment_verification if applicable → ready_for_disbursement → disbursement_processing → disbursed.

## Alternate paths
Review stages → additional_information_required → return to appropriate review stage after response.
Approval pending → rejected.
Offer sent → declined or expired.
Allowed pre-final stages → cancelled.

## Hard rules
- Backend owns transitions.
- Customer cannot arbitrarily set status.
- Rejected cannot become approved through ordinary action; require explicit reconsideration flow.
- Accepted offer must be active and not expired.
- Ready for disbursement requires configured prerequisites.
- Disbursed cannot return to pre-disbursement through normal UI.
- Every transition writes status history and relevant audit record.

## Customer labels
Draft / Submitted / Under Review / Action Required / Under Assessment / Approved / Offer Available / Formalities Pending / Payment Pending / Ready for Disbursement / Disbursement Processing / Disbursed / Rejected / Cancelled.
