<?php

namespace App\Http\Controllers;

use App\Enums\DisbursementStatus;
use App\Enums\LoanStatus;
use App\Models\DisbursementRecord;
use App\Models\LoanApplication;
use App\Services\AuditService;
use App\Services\LoanStateMachine;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class DisbursementController extends Controller
{
    public function verifyChecklist(Request $request, int $applicationId): JsonResponse
    {
        $user = $request->user();
        if (!$user->isStaff()) {
            abort(403, 'Unauthorized.');
        }

        $request->validate([
            'kyc_verified' => 'required|boolean',
            'agreement_executed' => 'required|boolean',
            'bank_account_verified' => 'required|boolean',
            'fee_paid' => 'required|boolean',
        ]);

        $application = LoanApplication::with(['financialDetails', 'paymentRecord', 'offer'])->findOrFail($applicationId);

        $passed = $request->input('kyc_verified') &&
                  $request->input('agreement_executed') &&
                  $request->input('bank_account_verified') &&
                  $request->input('fee_paid');

        $disbursementNumber = 'DISB-' . date('Ymd') . '-' . strtoupper(Str::random(6));

        $disbursement = DisbursementRecord::updateOrCreate(
            ['application_id' => $application->id],
            [
                'payment_record_id' => $application->paymentRecord?->id,
                'disbursement_number' => $disbursementNumber,
                'amount' => $application->approved_amount ?? $application->requested_amount,
                'bank_name' => $application->financialDetails?->primary_bank_name ?? 'HDFC Bank',
                'account_number' => $application->financialDetails?->account_number ?? '1234567890',
                'ifsc_code' => $application->financialDetails?->ifsc_code ?? 'HDFC0001234',
                'status' => DisbursementStatus::PENDING,
                'checklist_passed' => $passed,
                'checklist_data' => $request->all(),
            ]
        );

        return response()->json([
            'success' => true,
            'message' => $passed ? 'Pre-disbursement checklist verified successfully.' : 'Checklist verification failed; mandatory items missing.',
            'data' => $disbursement,
        ]);
    }

    public function processDisbursement(Request $request, int $applicationId, LoanStateMachine $stateMachine): JsonResponse
    {
        $user = $request->user();
        if (!$user->isStaff()) {
            abort(403, 'Unauthorized.');
        }

        $request->validate([
            'transaction_reference' => 'required|string|max:100',
        ]);

        $application = LoanApplication::with('disbursementRecord')->findOrFail($applicationId);
        $disbursement = $application->disbursementRecord;

        if (!$disbursement || !$disbursement->checklist_passed) {
            return response()->json(['success' => false, 'message' => 'Cannot disburse. Checklist must be completed and passed.'], 422);
        }

        $disbursement->update([
            'status' => DisbursementStatus::DISBURSED,
            'transaction_reference' => $request->input('transaction_reference'),
            'disbursed_by_user_id' => $user->id,
            'disbursed_at' => now(),
        ]);

        AuditService::log('loan_disbursed', 'DisbursementRecord', $disbursement->id, null, [
            'amount' => $disbursement->amount,
            'ref' => $disbursement->transaction_reference,
        ]);

        $stateMachine->transition($application, LoanStatus::DISBURSED, 'Loan amount disbursed to customer bank account. Ref: ' . $request->input('transaction_reference'), $user->id);

        return response()->json([
            'success' => true,
            'message' => 'Loan successfully disbursed!',
            'data' => $disbursement->fresh(),
        ]);
    }
}
