<?php

namespace App\Enums;

enum LoanStatus: string
{
    case DRAFT = 'draft';
    case SUBMITTED = 'submitted';
    case INITIAL_REVIEW = 'initial_review';
    case DOCUMENTS_PENDING = 'documents_pending';
    case DOCUMENT_VERIFICATION = 'document_verification';
    case ADDITIONAL_INFO_REQUIRED = 'additional_information_required';
    case ELIGIBILITY_REVIEW = 'eligibility_review';
    case CREDIT_ASSESSMENT = 'credit_assessment';
    case APPROVAL_PENDING = 'approval_pending';
    case APPROVED = 'approved';
    case REJECTED = 'rejected';
    case OFFER_PREPARATION = 'offer_preparation';
    case OFFER_SENT = 'offer_sent';
    case OFFER_ACCEPTED = 'offer_accepted';
    case OFFER_DECLINED = 'offer_declined';
    case OFFER_EXPIRED = 'offer_expired';
    case AGREEMENT_PENDING = 'agreement_pending';
    case PAYMENT_PENDING = 'payment_pending';
    case PAYMENT_VERIFICATION = 'payment_verification';
    case READY_FOR_DISBURSEMENT = 'ready_for_disbursement';
    case DISBURSEMENT_PROCESSING = 'disbursement_processing';
    case DISBURSED = 'disbursed';
    case CANCELLED = 'cancelled';
    case CLOSED = 'closed';

    public function customerLabel(): string
    {
        return match ($this) {
            self::DRAFT => 'Draft Application',
            self::SUBMITTED => 'Application Submitted',
            self::INITIAL_REVIEW, self::DOCUMENT_VERIFICATION, self::ELIGIBILITY_REVIEW => 'Under Review',
            self::DOCUMENTS_PENDING => 'Documents Pending',
            self::ADDITIONAL_INFO_REQUIRED => 'Action Required (Info Needed)',
            self::CREDIT_ASSESSMENT, self::APPROVAL_PENDING => 'Under Assessment',
            self::APPROVED => 'Loan Approved',
            self::REJECTED => 'Application Declined',
            self::OFFER_PREPARATION, self::OFFER_SENT => 'Loan Offer Available',
            self::OFFER_ACCEPTED, self::AGREEMENT_PENDING => 'Formalities Pending',
            self::OFFER_DECLINED => 'Offer Declined',
            self::OFFER_EXPIRED => 'Offer Expired',
            self::PAYMENT_PENDING => 'Processing Fee Payment Pending',
            self::PAYMENT_VERIFICATION => 'Payment Verification In Progress',
            self::READY_FOR_DISBURSEMENT => 'Ready for Disbursement',
            self::DISBURSEMENT_PROCESSING => 'Disbursement In Progress',
            self::DISBURSED => 'Funds Disbursed',
            self::CANCELLED => 'Application Cancelled',
            self::CLOSED => 'Loan Closed',
        };
    }

    public function allowedNextStatuses(): array
    {
        return match ($this) {
            self::DRAFT => [self::SUBMITTED, self::CANCELLED],
            self::SUBMITTED => [self::INITIAL_REVIEW, self::DOCUMENTS_PENDING, self::DOCUMENT_VERIFICATION, self::ELIGIBILITY_REVIEW, self::CREDIT_ASSESSMENT, self::APPROVAL_PENDING, self::APPROVED, self::OFFER_PREPARATION, self::OFFER_SENT, self::OFFER_ACCEPTED, self::AGREEMENT_PENDING, self::PAYMENT_PENDING, self::PAYMENT_VERIFICATION, self::READY_FOR_DISBURSEMENT, self::DISBURSED, self::OFFER_DECLINED, self::CANCELLED],
            self::INITIAL_REVIEW => [self::DOCUMENT_VERIFICATION, self::ELIGIBILITY_REVIEW, self::CREDIT_ASSESSMENT, self::APPROVAL_PENDING, self::APPROVED, self::OFFER_PREPARATION, self::OFFER_SENT, self::ADDITIONAL_INFO_REQUIRED, self::REJECTED, self::CANCELLED],
            self::DOCUMENTS_PENDING => [self::DOCUMENT_VERIFICATION, self::CANCELLED],
            self::DOCUMENT_VERIFICATION => [self::ELIGIBILITY_REVIEW, self::CREDIT_ASSESSMENT, self::APPROVAL_PENDING, self::APPROVED, self::OFFER_PREPARATION, self::OFFER_SENT, self::ADDITIONAL_INFO_REQUIRED, self::REJECTED, self::CANCELLED],
            self::ADDITIONAL_INFO_REQUIRED => [self::DOCUMENT_VERIFICATION, self::INITIAL_REVIEW, self::CREDIT_ASSESSMENT, self::CANCELLED],
            self::ELIGIBILITY_REVIEW => [self::CREDIT_ASSESSMENT, self::APPROVAL_PENDING, self::APPROVED, self::OFFER_PREPARATION, self::OFFER_SENT, self::REJECTED, self::ADDITIONAL_INFO_REQUIRED, self::CANCELLED],
            self::CREDIT_ASSESSMENT => [self::APPROVAL_PENDING, self::APPROVED, self::OFFER_PREPARATION, self::OFFER_SENT, self::REJECTED, self::ADDITIONAL_INFO_REQUIRED, self::CANCELLED],
            self::APPROVAL_PENDING => [self::APPROVED, self::OFFER_PREPARATION, self::OFFER_SENT, self::REJECTED, self::CREDIT_ASSESSMENT, self::CANCELLED],
            self::APPROVED => [self::OFFER_PREPARATION, self::OFFER_SENT, self::OFFER_ACCEPTED, self::AGREEMENT_PENDING, self::PAYMENT_PENDING, self::READY_FOR_DISBURSEMENT, self::OFFER_DECLINED, self::CANCELLED],
            self::OFFER_PREPARATION => [self::OFFER_SENT, self::OFFER_DECLINED, self::CANCELLED],
            self::OFFER_SENT => [self::OFFER_ACCEPTED, self::AGREEMENT_PENDING, self::PAYMENT_PENDING, self::PAYMENT_VERIFICATION, self::READY_FOR_DISBURSEMENT, self::DISBURSED, self::OFFER_DECLINED, self::OFFER_EXPIRED, self::OFFER_SENT, self::CANCELLED],
            self::OFFER_ACCEPTED => [self::AGREEMENT_PENDING, self::PAYMENT_PENDING, self::PAYMENT_VERIFICATION, self::READY_FOR_DISBURSEMENT, self::DISBURSED, self::OFFER_DECLINED, self::CANCELLED],
            self::AGREEMENT_PENDING => [self::PAYMENT_PENDING, self::PAYMENT_VERIFICATION, self::READY_FOR_DISBURSEMENT, self::DISBURSED, self::OFFER_DECLINED, self::CANCELLED],
            self::PAYMENT_PENDING => [self::PAYMENT_PENDING, self::PAYMENT_VERIFICATION, self::READY_FOR_DISBURSEMENT, self::DISBURSED, self::OFFER_DECLINED, self::CANCELLED],
            self::PAYMENT_VERIFICATION => [self::READY_FOR_DISBURSEMENT, self::DISBURSED, self::PAYMENT_PENDING, self::PAYMENT_VERIFICATION, self::OFFER_DECLINED, self::CANCELLED],
            self::READY_FOR_DISBURSEMENT => [self::READY_FOR_DISBURSEMENT, self::DISBURSEMENT_PROCESSING, self::DISBURSED, self::OFFER_DECLINED, self::OFFER_SENT, self::CANCELLED],
            self::DISBURSEMENT_PROCESSING => [self::DISBURSED, self::READY_FOR_DISBURSEMENT, self::CANCELLED],
            self::DISBURSED => [self::CLOSED],
            self::OFFER_DECLINED => [self::OFFER_PREPARATION, self::OFFER_SENT, self::APPROVED, self::REJECTED, self::CANCELLED],
            self::REJECTED, self::OFFER_EXPIRED, self::CANCELLED, self::CLOSED => [],
        };
    }
}
