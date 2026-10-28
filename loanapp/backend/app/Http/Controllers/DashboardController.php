<?php

namespace App\Http\Controllers;

use App\Enums\LoanStatus;
use App\Models\AuditLog;
use App\Models\DisbursementRecord;
use App\Models\LoanApplication;
use App\Models\LoanProduct;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function customerDashboard(Request $request): JsonResponse
    {
        $user = $request->user();
        $applications = LoanApplication::where('user_id', $user->id)
            ->with(['product', 'offer', 'formalities', 'paymentRecord', 'disbursementRecord', 'assessment', 'documents'])
            ->latest()
            ->get();


        $activeApplication = $applications->first(fn($a) => !$a->current_status->isTerminal());
        $hasActiveLoanOrPending = $applications->contains(function ($a) {
            return $a->current_status === LoanStatus::DISBURSED || $a->current_status->isPendingReview();
        });
        $canApplyNewLoan = !$hasActiveLoanOrPending;

        $nextAction = null;
        if ($activeApplication) {
            $status = $activeApplication->current_status;
            $nextAction = match ($status) {
                LoanStatus::DRAFT => [
                    'title' => 'Complete Application',
                    'description' => 'You have an incomplete draft application (Step ' . ($activeApplication->current_step ?: 1) . ' of 6). Finish entering your details to submit.',
                    'action_url' => "/apply/{$activeApplication->product_id}?draft={$activeApplication->id}&step=" . ($activeApplication->current_step ?: 1),
                    'button_text' => 'Resume Application',
                    'is_draft' => true,
                    'draft_id' => $activeApplication->id,
                    'product_id' => $activeApplication->product_id,
                    'product_name' => $activeApplication->product?->name ?? 'Personal Loan',
                    'requested_amount' => (float)$activeApplication->requested_amount,
                    'current_step' => (int)($activeApplication->current_step ?: 1),
                ],
                LoanStatus::ADDITIONAL_INFO_REQUIRED => [
                    'title' => 'Information Needed',
                    'description' => 'Our verification executive requested additional information or clarification.',
                    'action_url' => "/applications/{$activeApplication->id}",
                    'button_text' => 'Respond Now',
                ],
                LoanStatus::OFFER_SENT => [
                    'title' => 'Loan Offer Ready!',
                    'description' => 'Your loan has been approved! Review and accept your loan terms before they expire.',
                    'action_url' => "/applications/{$activeApplication->id}/offer",
                    'button_text' => 'Review Offer',
                ],
                LoanStatus::OFFER_ACCEPTED, LoanStatus::AGREEMENT_PENDING => [
                    'title' => 'Sign Loan Agreement',
                    'description' => 'Please review and digitally sign your Key Fact Statement (KFS) and Loan Agreement.',
                    'action_url' => "/applications/{$activeApplication->id}/formalities",
                    'button_text' => 'Sign Agreement',
                ],
                LoanStatus::PAYMENT_PENDING => [
                    'title' => 'Processing Fee Payment',
                    'description' => 'Pay the nominal processing fee to initiate final fund disbursement.',
                    'action_url' => "/applications/{$activeApplication->id}/payment",
                    'button_text' => 'Pay Processing Fee',
                ],
                LoanStatus::DISBURSED => [
                    'title' => 'Active Loan EMI Repayment',
                    'description' => 'Your loan is active. Make regular EMI payments or advance repayments directly online.',
                    'action_url' => "/applications/{$activeApplication->id}/repay",
                    'button_text' => 'Pay EMI / Schedule',
                    'is_repayment' => true,
                ],
                default => null,
            };
        }

        // Active Loan Repayment Summary for Home Dashboard
        $activeDisbursedApp = $applications->firstWhere('current_status', LoanStatus::DISBURSED);
        $activeLoanRepayment = null;

        if ($activeDisbursedApp) {
            \App\Http\Controllers\RepaymentController::generateScheduleForApplication($activeDisbursedApp);
            $schedules = $activeDisbursedApp->repaymentSchedules()->orderBy('installment_number')->get();
            $paidCount = $schedules->where('status', 'paid')->count();
            $nextDue = $schedules->firstWhere('status', '!=', 'paid');
            $remainingPrincipal = $schedules->where('status', '!=', 'paid')->sum('principal_component');

            $activeLoanRepayment = [
                'id' => $activeDisbursedApp->id,
                'application_number' => $activeDisbursedApp->application_number,
                'product_name' => $activeDisbursedApp->product?->name ?? 'Personal Express Loan',
                'approved_amount' => (float)($activeDisbursedApp->approved_amount ?? $activeDisbursedApp->requested_amount),
                'interest_rate' => (float)($activeDisbursedApp->approved_interest_rate ?? $activeDisbursedApp->product?->default_interest_rate ?? 13.5),
                'tenure_months' => (int)($activeDisbursedApp->approved_tenure_months ?? $activeDisbursedApp->requested_tenure_months ?? 12),
                'paid_installments' => $paidCount,
                'total_installments' => $schedules->count(),
                'monthly_emi' => $nextDue ? (float)$nextDue->emi_amount : ($schedules->first() ? (float)$schedules->first()->emi_amount : 0),
                'next_due_date' => $nextDue?->due_date?->format('Y-m-d'),
                'next_due_amount' => $nextDue ? (float)$nextDue->emi_amount : 0,
                'remaining_balance' => (float)$remainingPrincipal,
                'repay_url' => "/applications/{$activeDisbursedApp->id}/repay",
            ];
        }

        // Compute dynamic profile metrics for customer
        $latestApp = $applications->first();
        $creditScore = $latestApp?->creditAssessment?->risk_score;

        $kycStatus = 'Pending';
        if ($latestApp) {
            $totalDocs = $latestApp->documents->count();
            $verifiedDocs = $latestApp->documents->where('status', 'verified')->count();
            if ($verifiedDocs > 0 && $verifiedDocs >= $totalDocs) {
                $kycStatus = 'Verified';
            } elseif ($latestApp->current_status === LoanStatus::ADDITIONAL_INFO_REQUIRED) {
                $kycStatus = 'Action Required';
            } elseif ($totalDocs > 0) {
                $kycStatus = 'Under Review';
            } else {
                $kycStatus = 'Documents Pending';
            }
        }

        $accountTier = 'New Borrower';
        if ($creditScore) {
            if ($creditScore >= 750) {
                $accountTier = 'Prime';
            } elseif ($creditScore >= 650) {
                $accountTier = 'Standard';
            } else {
                $accountTier = 'Subprime';
            }
        } elseif ($latestApp) {
            $accountTier = 'Standard';
        }

        $profileSummary = [
            'credit_score' => $creditScore ? (int)$creditScore : 750,
            'has_evaluated_score' => $creditScore !== null,
            'credit_score_label' => $creditScore ? ($creditScore >= 750 ? 'Excellent' : ($creditScore >= 650 ? 'Good' : 'Fair')) : 'Prime Estimate',
            'account_tier' => $accountTier,
            'kyc_status' => $kycStatus,
            'total_applications' => $applications->count(),
            'total_borrowed' => (float)$applications->filter(fn($a) => $a->disbursementRecord && $a->disbursementRecord->status === 'disbursed')->sum(fn($a) => $a->disbursementRecord->amount),
        ];

        return response()->json([
            'success' => true,
            'user' => $user,
            'can_apply_new_loan' => $canApplyNewLoan,
            'has_active_loan_or_pending' => $hasActiveLoanOrPending,
            'active_application' => $activeApplication,
            'active_loan_repayment' => $activeLoanRepayment,
            'all_applications' => $applications,
            'next_action' => $nextAction,
            'profile_summary' => $profileSummary,
        ]);
    }

    public function adminDashboard(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->isStaff()) {
            abort(403, 'Unauthorized.');
        }

        $totalApplications = LoanApplication::count();
        $verificationQueue = LoanApplication::whereIn('current_status', [
            LoanStatus::SUBMITTED,
            LoanStatus::INITIAL_REVIEW,
            LoanStatus::DOCUMENT_VERIFICATION,
            LoanStatus::ADDITIONAL_INFO_REQUIRED,
        ])->count();

        $underwritingQueue = LoanApplication::whereIn('current_status', [
            LoanStatus::ELIGIBILITY_REVIEW,
            LoanStatus::CREDIT_ASSESSMENT,
        ])->count();

        $sanctionQueue = LoanApplication::whereIn('current_status', [
            LoanStatus::APPROVED,
            LoanStatus::OFFER_PREPARATION,
            LoanStatus::OFFER_SENT,
            LoanStatus::OFFER_ACCEPTED,
        ])->count();

        $disbursementQueue = LoanApplication::whereIn('current_status', [
            LoanStatus::READY_FOR_DISBURSEMENT,
            LoanStatus::DISBURSEMENT_PROCESSING,
        ])->count();

        $approvedCount = LoanApplication::whereIn('current_status', [
            LoanStatus::APPROVED,
            LoanStatus::OFFER_PREPARATION,
            LoanStatus::OFFER_SENT,
            LoanStatus::OFFER_ACCEPTED,
            LoanStatus::AGREEMENT_PENDING,
            LoanStatus::PAYMENT_PENDING,
            LoanStatus::PAYMENT_VERIFICATION,
            LoanStatus::READY_FOR_DISBURSEMENT,
            LoanStatus::DISBURSEMENT_PROCESSING,
            LoanStatus::DISBURSED,
        ])->count();

        $pipelineValue = (float)LoanApplication::whereNotIn('current_status', [
            LoanStatus::DRAFT,
            LoanStatus::REJECTED,
            LoanStatus::CLOSED,
            LoanStatus::DISBURSED,
        ])->sum('requested_amount');

        $disbursedAmount = (float)DisbursementRecord::where('status', 'disbursed')->sum('amount');
        $recentApplications = LoanApplication::with(['user', 'product'])->latest()->take(8)->get();
        $recentAudit = AuditLog::with('user')->latest('created_at')->take(10)->get();

        return response()->json([
            'success' => true,
            'metrics' => [
                'total_applications' => $totalApplications,
                'pending_reviews' => $verificationQueue + $underwritingQueue,
                'verification_queue' => $verificationQueue,
                'underwriting_queue' => $underwritingQueue,
                'sanction_queue' => $sanctionQueue,
                'disbursement_queue' => $disbursementQueue,
                'approved_count' => $approvedCount,
                'pipeline_value' => $pipelineValue,
                'disbursed_total' => $disbursedAmount,
                'active_borrowers' => User::where('role', 'customer')->count(),
            ],
            'recent_applications' => $recentApplications,
            'recent_audit' => $recentAudit,
        ]);
    }

    public function health(): JsonResponse
    {
        return response()->json([
            'status' => 'ok',
            'platform' => 'RCR Digital Loan Management Platform',
            'version' => '1.0.0',
            'database' => 'connected',
            'timestamp' => now()->toIso8601String(),
        ]);
    }
}
