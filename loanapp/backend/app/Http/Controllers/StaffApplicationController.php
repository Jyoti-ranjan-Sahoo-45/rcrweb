<?php

namespace App\Http\Controllers;

use App\Enums\DisbursementStatus;
use App\Enums\LoanStatus;
use App\Enums\OfferStatus;
use App\Enums\PaymentStatus;
use App\Models\Assessment;
use App\Models\Decision;
use App\Models\DisbursementRecord;
use App\Models\InformationRequest;
use App\Models\InternalNote;
use App\Models\LoanApplication;
use App\Models\LoanOffer;
use App\Models\Notification;
use App\Models\PaymentRecord;
use App\Models\User;
use App\Services\AuditService;
use App\Services\EligibilityEngine;
use App\Services\LoanStateMachine;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class StaffApplicationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->isStaff()) {
            abort(403, 'Unauthorized.');
        }

        $query = LoanApplication::with(['user', 'product', 'assignedTo', 'offer', 'paymentRecord', 'disbursementRecord']);

        // Search & Filters
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('application_number', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%")
                         ->orWhere('email', 'like', "%{$search}%")
                         ->orWhere('phone', 'like', "%{$search}%");
                  });
            });
        }

        if ($status = $request->input('status')) {
            $query->where('current_status', $status);
        }

        if ($productId = $request->input('product_id')) {
            $query->where('product_id', $productId);
        }

        if ($assignedTo = $request->input('assigned_to')) {
            $query->where('assigned_to_user_id', $assignedTo);
        }

        $applications = $query->latest()->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $applications,
        ]);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        if (!$user->isStaff()) {
            abort(403, 'Unauthorized.');
        }

        $application = LoanApplication::with([
            'user',
            'product.documentRequirements',
            'product.eligibilityRule',
            'personalDetails',
            'employmentDetails',
            'businessDetails',
            'financialDetails',
            'documents.verifiedBy',
            'informationRequests.requestedBy',
            'internalNotes.author',
            'assessment.assessor',
            'decision.decider',
            'offer.formality',
            'formalities',
            'paymentRecord.verifiedBy',
            'disbursementRecord.disbursedBy',
            'statusHistory.changedBy',
            'repaymentSchedules',
            'repaymentTransactions.verifiedBy',
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $application,
            'customer_live_state' => [
                'has_active_offer' => $application->offer !== null,
                'offer_status' => $application->offer?->status?->value ?? ($application->offer?->status ?? 'none'),
                'offer_accepted_at' => $application->offer?->accepted_at?->toIso8601String(),
                'offer_declined_at' => $application->offer?->declined_at?->toIso8601String(),
                'accepted_amount' => $application->offer?->approved_amount,
                'accepted_tenure' => $application->offer?->approved_tenure_months,
                'accepted_rate' => $application->offer?->interest_rate,
                'accepted_emi' => $application->offer?->emi_amount,
                'formalities_signed' => (bool)($application->formalities?->is_acknowledged ?? $application->offer?->formality?->is_acknowledged),
                'formalities_signed_at' => $application->formalities?->customer_signed_at?->toIso8601String() ?? $application->offer?->formality?->customer_signed_at?->toIso8601String(),
                'customer_ip' => $application->formalities?->customer_ip ?? $application->offer?->formality?->customer_ip,
                'payment_status' => $application->paymentRecord?->status?->value ?? ($application->paymentRecord?->status ?? 'none'),
                'payment_amount' => $application->paymentRecord?->amount,
                'payment_utr' => $application->paymentRecord?->utr_number,
                'payment_paid_at' => $application->paymentRecord?->paid_at?->toIso8601String(),
                'current_stage_label' => $application->current_status->customerLabel(),
            ],
            'allowed_transitions' => array_map(fn($s) => $s->value, $application->current_status->allowedNextStatuses()),
        ]);
    }

    /**
     * Unified, 1-Click Sanction & Manual Processing Fee Offer
     */
    public function quickSanctionOffer(Request $request, int $id, EligibilityEngine $engine, LoanStateMachine $stateMachine): JsonResponse
    {
        $user = $request->user();
        if (!$user->isStaff()) {
            abort(403, 'Unauthorized.');
        }

        $validated = $request->validate([
            'approved_amount' => 'required|numeric|min:1000',
            'approved_tenure_months' => 'required|integer|min:1',
            'interest_rate' => 'required|numeric|min:0',
            'processing_fee' => 'required|numeric|min:0',
            'remarks' => 'nullable|string|max:1000',
        ]);

        $application = LoanApplication::with(['product', 'employmentDetails', 'financialDetails', 'paymentRecord'])->findOrFail($id);

        $amount = (float)$validated['approved_amount'];
        $tenure = (int)$validated['approved_tenure_months'];
        $rate = (float)$validated['interest_rate'];
        $fee = (float)$validated['processing_fee'];
        $remarks = $validated['remarks'] ?? 'Loan approved and ready for disbursement with finalized terms.';

        $emi = $engine->calculateEmi($amount, $rate, $tenure);
        $totalPayable = round(($emi * $tenure) + $fee, 2);
        $offerNumber = 'OFF-' . date('Ymd') . '-' . strtoupper(Str::random(6));

        DB::transaction(function () use ($application, $amount, $tenure, $rate, $fee, $emi, $totalPayable, $offerNumber, $remarks, $user, $stateMachine) {
            // 1. Update Application approved terms
            $application->update([
                'approved_amount' => $amount,
                'approved_tenure_months' => $tenure,
                'approved_interest_rate' => $rate,
            ]);

            // 2. Auto-record Assessment
            $monthlyInc = (float)($application->employmentDetails?->monthly_income ?? 45000);
            $oblig = (float)($application->financialDetails?->existing_emi_obligations ?? 0);
            $dti = $monthlyInc > 0 ? round(($oblig / $monthlyInc) * 100, 2) : 0;

            Assessment::updateOrCreate(
                ['application_id' => $application->id],
                [
                    'assessor_user_id' => $user->id,
                    'calculated_income' => $monthlyInc,
                    'total_obligations' => $oblig,
                    'dti_ratio' => $dti,
                    'risk_score' => 750,
                    'recommended_amount' => $amount,
                    'recommended_tenure_months' => $tenure,
                    'recommended_rate' => $rate,
                    'remarks' => $remarks,
                ]
            );

            // 3. Auto-record Decision
            Decision::updateOrCreate(
                ['application_id' => $application->id],
                [
                    'decider_user_id' => $user->id,
                    'decision' => 'approved',
                    'approved_amount' => $amount,
                    'approved_tenure_months' => $tenure,
                    'approved_rate' => $rate,
                    'remarks' => $remarks,
                ]
            );

            // Check if customer has already paid the one-time processing fee for this application
            $hasPayment = ($application->paymentRecord && in_array($application->paymentRecord->status, [PaymentStatus::VERIFIED, PaymentStatus::PENDING_VERIFICATION, PaymentStatus::COMPLETED]))
                || ($application->paymentRecord && (float)$application->paymentRecord->amount > 0);

            // One application = One processing fee rule
            $effectiveFee = $hasPayment ? 0.00 : $fee;
            $effectiveTotalPayable = round(($emi * $tenure) + $effectiveFee, 2);

            // 4. Record/Update Loan Offer with exact manual processing fee and recalculated EMI
            $offer = LoanOffer::updateOrCreate(
                ['application_id' => $application->id],
                [
                    'offer_number' => $offerNumber,
                    'approved_amount' => $amount,
                    'approved_tenure_months' => $tenure,
                    'interest_rate' => $rate,
                    'emi_amount' => $emi,
                    'processing_fee' => $effectiveFee,
                    'total_payable' => $effectiveTotalPayable,
                    'status' => OfferStatus::ISSUED,
                    'issued_at' => now(),
                    'expires_at' => now()->addDays(14),
                    'remarks' => $remarks . ($hasPayment ? ' (Processing fee already cleared & confirmed)' : ''),
                ]
            );

            AuditService::log('offer_sanctioned_and_issued', 'LoanOffer', $offer->id, null, [
                'amount' => $amount,
                'fee' => $effectiveFee,
                'fee_cleared' => $hasPayment,
                'emi' => $emi,
                'by' => $user->name,
            ]);

            // 5. Update Status: If payment is already completed/verified, customer only needs to review/accept or is ready for disbursement
            if ($application->current_status !== LoanStatus::OFFER_SENT) {
                if (in_array(LoanStatus::OFFER_SENT, $application->current_status->allowedNextStatuses(), true)) {
                    $stateMachine->transition($application, LoanStatus::OFFER_SENT, "Sanctioned ₹{$amount} with EMI ₹{$emi}/mo. Offer issued to customer." . ($hasPayment ? " (Processing fee already paid)." : ""), $user->id);
                } else {
                    $application->update(['current_status' => LoanStatus::OFFER_SENT]);
                }
            }
        });

        return response()->json([
            'success' => true,
            'message' => "Approved & Ready for Disbursement! Final loan terms: ₹" . number_format($amount) . " with EMI ₹" . number_format($emi) . "/month.",
            'data' => $application->fresh(['offer', 'decision', 'assessment', 'paymentRecord', 'disbursementRecord']),
        ]);
    }

    /**
     * Unified, 1-Click Payment Verification & Fund Disbursement
     */
    public function quickVerifyAndDisburse(Request $request, int $id, LoanStateMachine $stateMachine): JsonResponse
    {
        $user = $request->user();
        if (!$user->isStaff()) {
            abort(403, 'Unauthorized.');
        }

        $request->validate([
            'payout_reference' => 'required|string|max:100',
            'remarks' => 'nullable|string|max:500',
        ]);

        $application = LoanApplication::with(['paymentRecord', 'financialDetails', 'offer', 'disbursementRecord', 'user'])->findOrFail($id);
        $payoutRef = $request->input('payout_reference');
        $disbAmt = (float)($application->approved_amount ?? $application->offer?->approved_amount ?? $application->requested_amount ?? 50000);

        DB::transaction(function () use ($application, $payoutRef, $disbAmt, $user, $stateMachine, $request) {
            // 1. Verify Payment if exists
            if ($application->paymentRecord) {
                $application->paymentRecord->update([
                    'status' => PaymentStatus::VERIFIED,
                    'verified_by_user_id' => $user->id,
                    'verification_remarks' => 'Verified and approved by ' . $user->name,
                ]);
            }

            // 2. Create/Update Disbursement Record
            $disbNumber = 'DISB-' . date('Ymd') . '-' . strtoupper(Str::random(6));
            $disb = DisbursementRecord::updateOrCreate(
                ['application_id' => $application->id],
                [
                    'payment_record_id' => $application->paymentRecord?->id,
                    'disbursement_number' => $disbNumber,
                    'amount' => $disbAmt,
                    'bank_name' => $application->financialDetails?->primary_bank_name ?? 'Bank Account',
                    'account_number' => $application->financialDetails?->account_number ?? '1234567890',
                    'ifsc_code' => $application->financialDetails?->ifsc_code ?? 'BANK0001234',
                    'transaction_reference' => $payoutRef,
                    'status' => DisbursementStatus::DISBURSED,
                    'checklist_passed' => true,
                    'disbursed_by_user_id' => $user->id,
                    'disbursed_at' => now(),
                ]
            );

            AuditService::log('loan_disbursed_quick', 'DisbursementRecord', $disb->id, null, [
                'amount' => $disbAmt,
                'payout_ref' => $payoutRef,
                'by' => $user->name,
            ]);

            // 3. Transition to DISBURSED
            $oldStatus = $application->current_status;
            $application->update(['current_status' => LoanStatus::DISBURSED]);

            \App\Models\ApplicationStatusHistory::create([
                'application_id' => $application->id,
                'from_status' => $oldStatus,
                'to_status' => LoanStatus::DISBURSED,
                'changed_by_user_id' => $user->id,
                'remarks' => "Funds disbursed via {$payoutRef}. Amount: ₹{$disbAmt}",
                'created_at' => now(),
            ]);

            // Notification to user
            \App\Models\Notification::create([
                'user_id' => $application->user_id,
                'title' => "Loan Disbursed ({$application->application_number})",
                'message' => "Your loan amount of ₹" . number_format($disbAmt) . " has been successfully disbursed to your bank account via reference {$payoutRef}.",
                'type' => 'success',
                'action_url' => "/applications/{$application->id}",
            ]);

            // 4. Auto-generate EMI Repayment Schedule for the loan
            try {
                \App\Http\Controllers\RepaymentController::generateScheduleForApplication($application->fresh(['disbursementRecord', 'product', 'offer']));
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning("Repayment schedule generation warning: " . $e->getMessage());
            }
        });

        return response()->json([
            'success' => true,
            'message' => "Payment verified and ₹" . number_format($disbAmt) . " marked as successfully disbursed!",
            'data' => $application->fresh(['disbursementRecord', 'paymentRecord', 'repaymentSchedules']),
        ]);
    }

    public function assign(Request $request, int $id): JsonResponse
    {
        $request->validate(['assigned_to_user_id' => 'required|exists:users,id']);

        $application = LoanApplication::findOrFail($id);
        $oldAssignee = $application->assigned_to_user_id;
        $application->update(['assigned_to_user_id' => $request->input('assigned_to_user_id')]);

        AuditService::log('application_assigned', 'LoanApplication', $application->id, ['assigned_to' => $oldAssignee], ['assigned_to' => $application->assigned_to_user_id]);

        return response()->json([
            'success' => true,
            'message' => 'Application assigned successfully.',
            'data' => $application->fresh('assignedTo'),
        ]);
    }

    public function addNote(Request $request, int $id): JsonResponse
    {
        $request->validate(['note' => 'required|string|max:2000']);

        $application = LoanApplication::findOrFail($id);
        $note = InternalNote::create([
            'application_id' => $application->id,
            'author_user_id' => $request->user()->id,
            'note' => $request->input('note'),
        ]);

        AuditService::log('internal_note_added', 'InternalNote', $note->id, null, ['application_id' => $application->id]);

        return response()->json([
            'success' => true,
            'message' => 'Internal note added.',
            'data' => $note->load('author'),
        ]);
    }

    public function requestInformation(Request $request, int $id, LoanStateMachine $stateMachine): JsonResponse
    {
        $request->validate(['message' => 'required|string|max:1000']);

        $application = LoanApplication::findOrFail($id);
        $info = InformationRequest::create([
            'application_id' => $application->id,
            'requested_by_user_id' => $request->user()->id,
            'message' => $request->input('message'),
            'status' => 'open',
        ]);

        if (in_array(LoanStatus::ADDITIONAL_INFO_REQUIRED, $application->current_status->allowedNextStatuses(), true)) {
            $stateMachine->transition($application, LoanStatus::ADDITIONAL_INFO_REQUIRED, 'Information requested by staff: ' . $request->input('message'), $request->user()->id);
        }

        return response()->json([
            'success' => true,
            'message' => 'Information request sent to customer.',
            'data' => $info,
        ]);
    }

    public function createAssessment(Request $request, int $id, LoanStateMachine $stateMachine): JsonResponse
    {
        $validated = $request->validate([
            'calculated_income' => 'required|numeric|min:0',
            'total_obligations' => 'required|numeric|min:0',
            'dti_ratio' => 'required|numeric|min:0',
            'risk_score' => 'required|integer|min:300|max:900',
            'recommended_amount' => 'required|numeric|min:1000',
            'recommended_tenure_months' => 'required|integer|min:1',
            'recommended_rate' => 'required|numeric|min:0',
            'remarks' => 'nullable|string|max:1000',
        ]);

        $application = LoanApplication::findOrFail($id);

        $assessment = Assessment::updateOrCreate(
            ['application_id' => $application->id],
            array_merge($validated, ['assessor_user_id' => $request->user()->id])
        );

        if (in_array(LoanStatus::CREDIT_ASSESSMENT, $application->current_status->allowedNextStatuses(), true)) {
            $stateMachine->transition($application, LoanStatus::CREDIT_ASSESSMENT, 'Credit assessment completed', $request->user()->id);
        }

        return response()->json([
            'success' => true,
            'message' => 'Credit assessment saved successfully.',
            'data' => $assessment->load('assessor'),
        ]);
    }

    public function makeDecision(Request $request, int $id, LoanStateMachine $stateMachine): JsonResponse
    {
        $validated = $request->validate([
            'decision' => 'required|in:approved,rejected,returned',
            'approved_amount' => 'required_if:decision,approved|nullable|numeric|min:1000',
            'approved_tenure_months' => 'required_if:decision,approved|nullable|integer|min:1',
            'approved_rate' => 'required_if:decision,approved|nullable|numeric|min:0',
            'remarks' => 'required|string|max:1000',
        ]);

        $application = LoanApplication::findOrFail($id);

        $decision = Decision::updateOrCreate(
            ['application_id' => $application->id],
            array_merge($validated, ['decider_user_id' => $request->user()->id])
        );

        if ($validated['decision'] === 'approved') {
            $application->update([
                'approved_amount' => $validated['approved_amount'],
                'approved_tenure_months' => $validated['approved_tenure_months'],
                'approved_interest_rate' => $validated['approved_rate'],
            ]);

            $targetStatus = in_array(LoanStatus::APPROVED, $application->current_status->allowedNextStatuses(), true)
                ? LoanStatus::APPROVED
                : (in_array(LoanStatus::APPROVAL_PENDING, $application->current_status->allowedNextStatuses(), true) ? LoanStatus::APPROVAL_PENDING : null);

            if ($targetStatus) {
                $stateMachine->transition($application, $targetStatus, 'Decision: Approved - ' . $validated['remarks'], $request->user()->id);
            }
        } elseif ($validated['decision'] === 'rejected') {
            $application->update(['rejection_reason' => $validated['remarks']]);
            $stateMachine->transition($application, LoanStatus::REJECTED, 'Decision: Rejected - ' . $validated['remarks'], $request->user()->id);
        }

        return response()->json([
            'success' => true,
            'message' => 'Decision processed successfully.',
            'data' => $decision->load('decider'),
        ]);
    }

    public function transitionStatus(Request $request, int $id, LoanStateMachine $stateMachine): JsonResponse
    {
        $request->validate([
            'target_status' => 'required|string',
            'remarks' => 'nullable|string|max:500',
        ]);

        $application = LoanApplication::findOrFail($id);
        $targetEnum = LoanStatus::from($request->input('target_status'));

        $updated = $stateMachine->transition($application, $targetEnum, $request->input('remarks'), $request->user()->id);

        return response()->json([
            'success' => true,
            'message' => "Application status changed to {$targetEnum->value}.",
            'data' => $updated,
        ]);
    }

    public function bulkDelete(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->isStaff()) {
            abort(403, 'Unauthorized.');
        }

        $ids = $request->input('ids', []);
        if (empty($ids) || !is_array($ids)) {
            return response()->json(['success' => false, 'message' => 'No application IDs provided for deletion.'], 400);
        }

        DB::beginTransaction();
        try {
            DB::statement('SET FOREIGN_KEY_CHECKS = 0');

            $appIdList = array_map('intval', $ids);
            
            DB::table('application_documents')->whereIn('application_id', $appIdList)->delete();
            DB::table('application_personal_details')->whereIn('application_id', $appIdList)->delete();
            DB::table('application_employment_details')->whereIn('application_id', $appIdList)->delete();
            DB::table('application_financial_details')->whereIn('application_id', $appIdList)->delete();
            DB::table('application_status_history')->whereIn('application_id', $appIdList)->delete();
            DB::table('loan_offers')->whereIn('application_id', $appIdList)->delete();
            DB::table('payment_records')->whereIn('application_id', $appIdList)->delete();
            DB::table('disbursement_records')->whereIn('application_id', $appIdList)->delete();
            DB::table('formalities')->whereIn('application_id', $appIdList)->delete();
            DB::table('information_requests')->whereIn('application_id', $appIdList)->delete();
            DB::table('internal_notes')->whereIn('application_id', $appIdList)->delete();
            DB::table('assessments')->whereIn('application_id', $appIdList)->delete();
            DB::table('decisions')->whereIn('application_id', $appIdList)->delete();
            DB::table('loan_repayment_schedules')->whereIn('application_id', $appIdList)->delete();
            DB::table('loan_repayment_transactions')->whereIn('application_id', $appIdList)->delete();

            $deletedCount = LoanApplication::whereIn('id', $appIdList)->delete();

            DB::statement('SET FOREIGN_KEY_CHECKS = 1');
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Successfully deleted {$deletedCount} application(s).",
                'deleted_count' => $deletedCount,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            DB::statement('SET FOREIGN_KEY_CHECKS = 1');
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete applications: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        $request->merge(['ids' => [(int)$id]]);
        return $this->bulkDelete($request);
    }
}
