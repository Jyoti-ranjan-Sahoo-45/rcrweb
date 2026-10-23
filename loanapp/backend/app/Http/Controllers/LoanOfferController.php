<?php

namespace App\Http\Controllers;

use App\Enums\LoanStatus;
use App\Enums\OfferStatus;
use App\Models\LoanApplication;
use App\Models\LoanOffer;
use App\Services\AuditService;
use App\Services\EligibilityEngine;
use App\Services\LoanStateMachine;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LoanOfferController extends Controller
{
    public function generate(Request $request, int $applicationId, EligibilityEngine $engine): JsonResponse
    {
        $user = $request->user();
        if (!$user->isStaff()) {
            abort(403, 'Unauthorized.');
        }

        $validated = $request->validate([
            'approved_amount' => 'required|numeric|min:1000',
            'approved_tenure_months' => 'required|integer|min:1',
            'interest_rate' => 'required|numeric|min:0',
            'processing_fee' => 'nullable|numeric|min:0',
            'expires_in_days' => 'nullable|integer|min:1|max:30',
            'remarks' => 'nullable|string|max:1000',
        ]);

        $application = LoanApplication::with('product')->findOrFail($applicationId);

        $amount = (float)$validated['approved_amount'];
        $tenure = (int)$validated['approved_tenure_months'];
        $rate = (float)$validated['interest_rate'];
        $fee = isset($validated['processing_fee']) ? (float)$validated['processing_fee'] : round($amount * ($application->product->processing_fee_pct / 100), 2);
        
        $emi = $engine->calculateEmi($amount, $rate, $tenure);
        $totalPayable = round(($emi * $tenure) + $fee, 2);
        $offerNumber = 'OFF-' . date('Ymd') . '-' . strtoupper(Str::random(6));

        $offer = LoanOffer::updateOrCreate(
            ['application_id' => $application->id],
            [
                'offer_number' => $offerNumber,
                'approved_amount' => $amount,
                'approved_tenure_months' => $tenure,
                'interest_rate' => $rate,
                'emi_amount' => $emi,
                'processing_fee' => $fee,
                'total_payable' => $totalPayable,
                'status' => OfferStatus::ISSUED,
                'issued_at' => now(),
                'expires_at' => now()->addDays($validated['expires_in_days'] ?? 7),
                'remarks' => $validated['remarks'] ?? null,
            ]
        );

        $application->update([
            'approved_amount' => $amount,
            'approved_tenure_months' => $tenure,
            'approved_interest_rate' => $rate,
        ]);

        AuditService::log('offer_generated', 'LoanOffer', $offer->id, null, [
            'offer_number' => $offerNumber,
            'amount' => $amount,
            'emi' => $emi,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Loan offer generated successfully.',
            'data' => $offer,
        ]);
    }

    public function issueOffer(Request $request, int $applicationId, LoanStateMachine $stateMachine): JsonResponse
    {
        $user = $request->user();
        if (!$user->isStaff()) {
            abort(403, 'Unauthorized.');
        }

        $application = LoanApplication::with('offer')->findOrFail($applicationId);
        if (!$application->offer) {
            return response()->json(['success' => false, 'message' => 'Please generate an offer first.'], 422);
        }

        if ($application->current_status !== LoanStatus::OFFER_SENT) {
            if (in_array(LoanStatus::OFFER_SENT, $application->current_status->allowedNextStatuses(), true)) {
                $stateMachine->transition($application, LoanStatus::OFFER_SENT, 'Loan offer issued to customer', $user->id);
            } else {
                $application->update(['current_status' => LoanStatus::OFFER_SENT]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Offer issued and sent to customer.',
            'data' => $application->fresh('offer'),
        ]);
    }

    public function accept(Request $request, int $applicationId, LoanStateMachine $stateMachine): JsonResponse
    {
        $application = LoanApplication::where('user_id', $request->user()->id)
            ->with(['offer', 'paymentRecord', 'formalities'])
            ->findOrFail($applicationId);
            
        $offer = $application->offer;

        if (!$offer || $offer->status !== OfferStatus::ISSUED) {
            return response()->json(['success' => false, 'message' => 'No active offer available to accept.'], 422);
        }

        if ($offer->expires_at && $offer->expires_at->isPast()) {
            $offer->update(['status' => OfferStatus::EXPIRED]);
            $stateMachine->transition($application, LoanStatus::OFFER_EXPIRED, 'Offer expired', $request->user()->id);
            return response()->json(['success' => false, 'message' => 'Offer has expired.'], 422);
        }

        $offer->update([
            'status' => OfferStatus::ACCEPTED,
            'accepted_at' => now(),
        ]);

        AuditService::log('offer_accepted', 'LoanOffer', $offer->id, null, ['status' => 'accepted']);

        // Check if customer has already paid processing fee for this application
        $hasPaid = ($application->paymentRecord && in_array($application->paymentRecord->status, [\App\Enums\PaymentStatus::VERIFIED, \App\Enums\PaymentStatus::PENDING_VERIFICATION, \App\Enums\PaymentStatus::COMPLETED]))
            || ($application->paymentRecord && (float)$application->paymentRecord->amount > 0);

        if ($hasPaid || (float)($offer->processing_fee ?? 0) <= 0) {
            // Already paid: if formalities already signed, move straight to ready for disbursement
            if ($application->formalities && $application->formalities->is_acknowledged) {
                $targetStatus = ($application->paymentRecord && $application->paymentRecord->status === \App\Enums\PaymentStatus::PENDING_VERIFICATION)
                    ? LoanStatus::PAYMENT_VERIFICATION
                    : LoanStatus::READY_FOR_DISBURSEMENT;
            } else {
                $targetStatus = LoanStatus::OFFER_ACCEPTED;
            }
        } else {
            $targetStatus = LoanStatus::OFFER_ACCEPTED;
        }

        // Transition application status cleanly
        if ($application->current_status !== $targetStatus) {
            if (in_array($targetStatus, $application->current_status->allowedNextStatuses(), true)) {
                $stateMachine->transition($application, $targetStatus, 'Customer accepted loan offer', $request->user()->id);
            } else {
                $application->update(['current_status' => $targetStatus]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Loan offer accepted! Please proceed to digital formalities.',
            'data' => $offer->fresh(),
            'fee_already_cleared' => $hasPaid,
        ]);
    }

    public function decline(Request $request, int $applicationId, LoanStateMachine $stateMachine): JsonResponse
    {
        $application = LoanApplication::where('user_id', $request->user()->id)->with('offer')->findOrFail($applicationId);
        $offer = $application->offer;

        if (!$offer) {
            return response()->json(['success' => false, 'message' => 'No offer to decline.'], 422);
        }

        $reason = $request->input('decline_reason') ?: 'Customer declined the loan offer terms';

        $offer->update([
            'status' => OfferStatus::DECLINED,
            'declined_at' => now(),
            'decline_reason' => $reason,
        ]);

        AuditService::log('offer_declined', 'LoanOffer', $offer->id, null, [
            'reason' => $reason,
            'amount' => $offer->approved_amount,
        ]);

        if (in_array(LoanStatus::OFFER_DECLINED, $application->current_status->allowedNextStatuses(), true)) {
            $stateMachine->transition($application, LoanStatus::OFFER_DECLINED, 'Customer declined offer: ' . $reason, $request->user()->id);
        } else {
            $application->update(['current_status' => LoanStatus::OFFER_DECLINED]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Offer declined.',
            'data' => $offer->fresh(),
        ]);
    }
}
