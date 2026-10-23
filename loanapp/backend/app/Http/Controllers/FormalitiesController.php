<?php

namespace App\Http\Controllers;

use App\Enums\LoanStatus;
use App\Models\Formality;
use App\Models\LoanApplication;
use App\Services\AuditService;
use App\Services\LoanStateMachine;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FormalitiesController extends Controller
{
    public function signAgreement(Request $request, int $applicationId, LoanStateMachine $stateMachine): JsonResponse
    {
        $request->validate([
            'acknowledge_kfs' => 'required|accepted',
            'acknowledge_agreement' => 'required|accepted',
        ]);

        $user = $request->user();
        $application = LoanApplication::where('user_id', $user->id)
            ->with(['offer', 'formalities', 'paymentRecord'])
            ->findOrFail($applicationId);

        if (!$application->offer) {
            return response()->json(['success' => false, 'message' => 'No offer associated with this application.'], 422);
        }

        $formality = Formality::updateOrCreate(
            ['application_id' => $application->id],
            [
                'offer_id' => $application->offer->id,
                'is_acknowledged' => true,
                'customer_signed_at' => now(),
                'customer_ip' => $request->ip(),
                'status' => 'completed',
            ]
        );

        AuditService::log('agreement_signed', 'Formality', $formality->id, null, [
            'ip' => $request->ip(),
            'signed_at' => now()->toIso8601String(),
        ]);

        // Check if customer already paid the one-time processing fee for this application
        $hasPaid = ($application->paymentRecord && in_array($application->paymentRecord->status, [\App\Enums\PaymentStatus::VERIFIED, \App\Enums\PaymentStatus::PENDING_VERIFICATION, \App\Enums\PaymentStatus::COMPLETED])) 
            || ($application->paymentRecord && (float)$application->paymentRecord->amount > 0);

        // If customer has already paid processing fee or fee is 0, transition straight to READY_FOR_DISBURSEMENT (or PAYMENT_VERIFICATION if receipt pending)
        if ($hasPaid || (float)($application->offer->processing_fee ?? 0) <= 0) {
            $targetStatus = ($application->paymentRecord && $application->paymentRecord->status === \App\Enums\PaymentStatus::PENDING_VERIFICATION)
                ? LoanStatus::PAYMENT_VERIFICATION
                : LoanStatus::READY_FOR_DISBURSEMENT;
        } else {
            $targetStatus = LoanStatus::PAYMENT_PENDING;
        }

        if ($application->current_status !== $targetStatus) {
            if (in_array($targetStatus, $application->current_status->allowedNextStatuses(), true)) {
                $stateMachine->transition($application, $targetStatus, 'Customer completed digital formalities & signed loan agreement', $user->id);
            } else {
                $application->update(['current_status' => $targetStatus]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Loan agreement & Key Fact Statement digitally signed and recorded.',
            'data' => $formality,
            'next_status' => $targetStatus->value,
            'fee_already_cleared' => $hasPaid,
        ]);
    }
}
