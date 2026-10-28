<?php

namespace App\Http\Controllers;

use App\Enums\LoanStatus;
use App\Enums\PaymentStatus;
use App\Models\LoanApplication;
use App\Models\PaymentRecord;
use App\Services\AuditService;
use App\Services\LoanStateMachine;
use App\Services\MetaCapiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    public function initiate(Request $request, int $applicationId): JsonResponse
    {
        $user = $request->user();
        $application = LoanApplication::where('user_id', $user->id)->with('offer')->findOrFail($applicationId);

        $amount = (float)ceil((float)($application->offer->processing_fee ?? 352.82));
        $transactionId = 'TXN-' . date('Ymd') . '-' . strtoupper(Str::random(8));

        $payment = PaymentRecord::updateOrCreate(
            ['application_id' => $application->id],
            [
                'transaction_id' => $transactionId,
                'payment_type' => 'processing_fee',
                'amount' => $amount,
                'status' => PaymentStatus::PENDING,
                'payment_method' => $request->input('payment_method', 'upi_qr'),
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Payment initiated.',
            'data' => $payment,
        ]);
    }

    public function submitReceipt(Request $request, int $applicationId, LoanStateMachine $stateMachine): JsonResponse
    {
        $user = $request->user();
        $application = LoanApplication::where('user_id', $user->id)->with('offer')->findOrFail($applicationId);

        $request->validate([
            'utr_number' => 'required|string|min:4|max:50',
            'payment_method' => 'nullable|string|max:50',
            'receipt' => 'required|file|mimes:jpeg,png,jpg,pdf,webp|max:5120',
        ]);

        $receiptFile = $request->file('receipt');
        $receiptPath = $receiptFile->store('receipts', 'public');

        $amount = (float)ceil((float)($application->offer->processing_fee ?? 352.82));
        $transactionId = 'TXN-' . date('Ymd') . '-' . strtoupper(Str::random(8));

        $payment = PaymentRecord::updateOrCreate(
            ['application_id' => $application->id],
            [
                'transaction_id' => $transactionId,
                'utr_number' => $request->input('utr_number'),
                'payment_type' => 'processing_fee',
                'amount' => $amount,
                'status' => PaymentStatus::PENDING_VERIFICATION,
                'payment_method' => $request->input('payment_method', 'upi_qr'),
                'gateway_reference' => $request->input('utr_number'),
                'receipt_path' => $receiptPath,
                'paid_at' => now(),
            ]
        );

        AuditService::log('payment_receipt_uploaded', 'PaymentRecord', $payment->id, null, [
            'amount' => $amount,
            'utr' => $request->input('utr_number'),
            'receipt' => $receiptPath,
        ]);

        if (in_array(LoanStatus::PAYMENT_VERIFICATION, $application->current_status->allowedNextStatuses(), true)) {
            $stateMachine->transition(
                $application,
                LoanStatus::PAYMENT_VERIFICATION,
                'Customer submitted payment receipt. UTR: ' . $request->input('utr_number'),
                $user->id
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Payment receipt uploaded successfully! Our team is verifying your payment.',
            'data' => $payment->fresh(),
        ]);
    }

    public function verifyPayment(Request $request, int $applicationId, LoanStateMachine $stateMachine): JsonResponse
    {
        $user = $request->user();
        if (!$user->isStaff()) {
            abort(403, 'Unauthorized.');
        }

        $request->validate([
            'action' => 'required|in:approve,reject',
            'remarks' => 'nullable|string|max:1000',
        ]);

        $application = LoanApplication::with('paymentRecord')->findOrFail($applicationId);
        $payment = $application->paymentRecord;

        if (!$payment) {
            return response()->json(['success' => false, 'message' => 'No payment record found for this application.'], 404);
        }

        $action = $request->input('action');
        $remarks = $request->input('remarks');

        if ($action === 'approve') {
            $payment->update([
                'status' => PaymentStatus::VERIFIED,
                'verified_by_user_id' => $user->id,
                'verification_remarks' => $remarks ?? 'Payment verified and approved by staff.',
            ]);

            AuditService::log('payment_verified', 'PaymentRecord', $payment->id, null, [
                'action' => 'approved',
                'verified_by' => $user->id,
            ]);

            if (in_array(LoanStatus::READY_FOR_DISBURSEMENT, $application->current_status->allowedNextStatuses(), true)) {
                $stateMachine->transition(
                    $application,
                    LoanStatus::READY_FOR_DISBURSEMENT,
                    'Processing fee payment verified by ' . $user->name,
                    $user->id
                );
            }

            return response()->json([
                'success' => true,
                'message' => 'Payment verified successfully. Application is now ready for disbursement!',
                'data' => $payment->fresh(),
            ]);
        } else {
            $payment->update([
                'status' => PaymentStatus::FAILED,
                'verified_by_user_id' => $user->id,
                'verification_remarks' => $remarks ?? 'Payment receipt was invalid or could not be verified.',
            ]);

            AuditService::log('payment_rejected', 'PaymentRecord', $payment->id, null, [
                'action' => 'rejected',
                'remarks' => $remarks,
            ]);

            if (in_array(LoanStatus::PAYMENT_PENDING, $application->current_status->allowedNextStatuses(), true)) {
                $stateMachine->transition(
                    $application,
                    LoanStatus::PAYMENT_PENDING,
                    'Payment receipt rejected: ' . ($remarks ?? 'Please re-upload valid payment receipt.'),
                    $user->id
                );
            }

            return response()->json([
                'success' => true,
                'message' => 'Payment rejected and customer requested to re-submit valid receipt.',
                'data' => $payment->fresh(),
            ]);
        }
    }

    public function mockPay(Request $request, int $applicationId, LoanStateMachine $stateMachine): JsonResponse
    {
        $user = $request->user();
        $application = LoanApplication::where('user_id', $user->id)->with('paymentRecord')->findOrFail($applicationId);
        $payment = $application->paymentRecord;

        if (!$payment) {
            $amount = (float)($application->offer->processing_fee ?? 352.82);
            $payment = PaymentRecord::create([
                'application_id' => $application->id,
                'transaction_id' => 'TXN-' . date('Ymd') . '-' . strtoupper(Str::random(8)),
                'utr_number' => 'MOCK' . mt_rand(100000000000, 999999999999),
                'payment_type' => 'processing_fee',
                'amount' => $amount,
                'status' => PaymentStatus::VERIFIED,
                'payment_method' => 'mock_instant',
                'gateway_reference' => 'GATEWAY_MOCK_' . strtoupper(Str::random(10)),
                'paid_at' => now(),
            ]);
        } else {
            $payment->update([
                'status' => PaymentStatus::VERIFIED,
                'gateway_reference' => 'GATEWAY_MOCK_' . strtoupper(Str::random(10)),
                'utr_number' => $payment->utr_number ?? 'MOCK' . mt_rand(100000000000, 999999999999),
                'paid_at' => now(),
            ]);
        }

        AuditService::log('payment_completed', 'PaymentRecord', $payment->id, null, [
            'amount' => $payment->amount,
            'ref' => $payment->gateway_reference,
        ]);

        $stateMachine->transition($application, LoanStatus::READY_FOR_DISBURSEMENT, 'Processing fee paid and verified', $user->id);

        MetaCapiService::sendEvent('Purchase', [
            'email' => $user->email,
            'phone' => $user->phone,
            'first_name' => explode(' ', $user->name)[0] ?? '',
        ], [
            'content_name' => 'Loan Processing Fee',
            'value' => (float)$payment->amount,
            'currency' => 'INR',
        ], $payment->transaction_id ?? null);

        return response()->json([
            'success' => true,
            'message' => 'Payment completed successfully. Application is now ready for disbursement!',
            'data' => $payment->fresh(),
        ]);
    }
}
