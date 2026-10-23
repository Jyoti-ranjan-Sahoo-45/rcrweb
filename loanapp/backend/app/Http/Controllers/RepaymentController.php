<?php

namespace App\Http\Controllers;

use App\Enums\LoanStatus;
use App\Models\LoanApplication;
use App\Models\LoanRepaymentSchedule;
use App\Models\LoanRepaymentTransaction;
use App\Services\AuditService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class RepaymentController extends Controller
{
    /**
     * Helper to calculate and generate monthly amortized EMI schedule
     */
    public static function generateScheduleForApplication(LoanApplication $application): void
    {
        if ($application->repaymentSchedules()->count() > 0) {
            return;
        }

        $principal = (float)($application->approved_amount ?? $application->requested_amount ?? 50000);
        $tenure = (int)($application->approved_tenure_months ?? $application->requested_tenure_months ?? 12);
        $annualRate = (float)($application->approved_interest_rate ?? $application->product?->default_interest_rate ?? 13.5);
        
        $monthlyRate = ($annualRate / 12) / 100;
        
        if ($monthlyRate > 0) {
            $emi = ($principal * $monthlyRate * pow(1 + $monthlyRate, $tenure)) / (pow(1 + $monthlyRate, $tenure) - 1);
        } else {
            $emi = $principal / max(1, $tenure);
        }
        $emi = round($emi, 2);

        $remainingPrincipal = $principal;
        $startDate = $application->disbursementRecord?->disbursed_at 
            ? Carbon::parse($application->disbursementRecord->disbursed_at)->addMonth() 
            : Carbon::now()->addMonth();

        for ($i = 1; $i <= $tenure; $i++) {
            $interestComponent = round($remainingPrincipal * $monthlyRate, 2);
            $principalComponent = round($emi - $interestComponent, 2);

            if ($i === $tenure) {
                // Adjust rounding difference in the last installment
                $principalComponent = $remainingPrincipal;
                $emi = round($principalComponent + $interestComponent, 2);
                $remainingPrincipal = 0;
            } else {
                $remainingPrincipal = max(0, round($remainingPrincipal - $principalComponent, 2));
            }

            $dueDate = (clone $startDate)->addMonths($i - 1)->day(min(5, (clone $startDate)->daysInMonth));

            LoanRepaymentSchedule::create([
                'application_id' => $application->id,
                'installment_number' => $i,
                'due_date' => $dueDate->format('Y-m-d'),
                'emi_amount' => $emi,
                'principal_component' => $principalComponent,
                'interest_component' => $interestComponent,
                'remaining_principal' => $remainingPrincipal,
                'status' => 'pending',
            ]);
        }
    }

    /**
     * Get repayment schedule & financial breakdown for an application
     */
    public function getSchedule(Request $request, int $applicationId): JsonResponse
    {
        $user = $request->user();
        $application = LoanApplication::with(['product', 'offer', 'disbursementRecord'])->findOrFail($applicationId);

        // Security check
        if (!$user->isStaff() && $application->user_id !== $user->id) {
            abort(403, 'Unauthorized.');
        }

        // Auto generate schedule if missing
        if ($application->repaymentSchedules()->count() === 0) {
            self::generateScheduleForApplication($application);
        }

        $schedules = $application->repaymentSchedules()->orderBy('installment_number')->get();
        $transactions = $application->repaymentTransactions()->latest()->get();

        $totalInstallments = $schedules->count();
        $paidInstallments = $schedules->where('status', 'paid')->count();
        $totalPaidAmount = (float)$schedules->where('status', 'paid')->sum('paid_amount');
        
        $pendingSchedules = $schedules->where('status', '!=', 'paid')->values();
        $nextDueInstallment = $pendingSchedules->first();

        // Calculate remaining principal balance
        $lastPaid = $schedules->where('status', 'paid')->last();
        $remainingPrincipalBalance = $lastPaid ? (float)$lastPaid->remaining_principal : (float)($application->approved_amount ?? $application->requested_amount);
        
        // Foreclosure amount is remaining principal balance
        $foreclosureAmount = round(max(0, $remainingPrincipalBalance), 2);

        $emiAmount = $nextDueInstallment ? (float)$nextDueInstallment->emi_amount : (float)($schedules->first()?->emi_amount ?? 0);

        return response()->json([
            'success' => true,
            'application' => [
                'id' => $application->id,
                'application_number' => $application->application_number,
                'current_status' => $application->current_status,
                'approved_amount' => (float)($application->approved_amount ?? $application->requested_amount),
                'tenure_months' => (int)($application->approved_tenure_months ?? $application->requested_tenure_months),
                'interest_rate' => (float)($application->approved_interest_rate ?? 13.5),
            ],
            'summary' => [
                'total_installments' => $totalInstallments,
                'paid_installments' => $paidInstallments,
                'pending_installments' => $totalInstallments - $paidInstallments,
                'total_paid_amount' => $totalPaidAmount,
                'remaining_principal_balance' => $remainingPrincipalBalance,
                'monthly_emi' => $emiAmount,
                'next_due_installment' => $nextDueInstallment,
                'foreclosure_amount' => $foreclosureAmount,
            ],
            'schedules' => $schedules,
            'transactions' => $transactions,
        ]);
    }

    /**
     * Customer submits repayment payment proof (1-month, multi-month, foreclosure)
     */
    public function submitRepayment(Request $request, int $applicationId): JsonResponse
    {
        $user = $request->user();
        $application = LoanApplication::findOrFail($applicationId);

        if (!$user->isStaff() && $application->user_id !== $user->id) {
            abort(403, 'Unauthorized.');
        }

        $validated = $request->validate([
            'repayment_type' => 'required|string|in:single_emi,multi_emi,foreclosure,custom',
            'months_count' => 'nullable|integer|min:1|max:60',
            'amount' => 'required|numeric|min:1',
            'utr_number' => 'required|string|min:4|max:100',
            'receipt' => 'nullable|file|mimes:jpeg,png,jpg,pdf,webp|max:10240',
            'payment_method' => 'nullable|string|max:50',
        ]);

        $receiptPath = null;
        if ($request->hasFile('receipt')) {
            $file = $request->file('receipt');
            $fileName = 'rep_' . $applicationId . '_' . time() . '_' . Str::random(8) . '.' . $file->getClientOriginalExtension();
            $receiptPath = $file->storeAs('repayments', $fileName, 'public');
        }

        // Determine which installments are covered
        $monthsCount = (int)($validated['months_count'] ?? 1);
        $pendingSchedules = $application->repaymentSchedules()
            ->where('status', '!=', 'paid')
            ->orderBy('installment_number')
            ->get();

        $installmentsCovered = [];
        if ($validated['repayment_type'] === 'foreclosure') {
            $installmentsCovered = $pendingSchedules->pluck('installment_number')->toArray();
        } else {
            $targetCount = min($monthsCount, $pendingSchedules->count());
            $installmentsCovered = $pendingSchedules->take($targetCount)->pluck('installment_number')->toArray();
        }

        $txnNumber = 'TXN-REP-' . date('Ymd') . '-' . strtoupper(Str::random(8));

        DB::beginTransaction();
        try {
            $transaction = LoanRepaymentTransaction::create([
                'application_id' => $application->id,
                'user_id' => $user->id,
                'transaction_number' => $txnNumber,
                'repayment_type' => $validated['repayment_type'],
                'installments_covered' => $installmentsCovered,
                'months_count' => count($installmentsCovered),
                'amount' => ceil((float)$validated['amount']),
                'payment_method' => $validated['payment_method'] ?? 'upi_qr',
                'utr_number' => $validated['utr_number'],
                'receipt_path' => $receiptPath,
                'status' => 'pending_verification',
                'paid_at' => Carbon::now(),
            ]);

            // Mark target installments as processing verification
            LoanRepaymentSchedule::where('application_id', $application->id)
                ->whereIn('installment_number', $installmentsCovered)
                ->update(['status' => 'processing_verification']);

            AuditService::log(
                'repayment_submitted',
                'LoanRepaymentTransaction',
                $transaction->id,
                null,
                [
                    'amount' => $transaction->amount,
                    'utr' => $transaction->utr_number,
                    'type' => $transaction->repayment_type,
                    'installments' => $installmentsCovered
                ],
                $user->id
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Repayment payment proof submitted successfully. Operations team will verify within 24–48 hours.',
                'transaction' => $transaction,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to record repayment: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Staff verifies a repayment transaction and credits installments
     */
    public function verifyRepayment(Request $request, int $transactionId): JsonResponse
    {
        $user = $request->user();
        if (!$user->isStaff()) {
            abort(403, 'Unauthorized.');
        }

        $validated = $request->validate([
            'status' => 'required|string|in:verified,rejected',
            'remarks' => 'nullable|string|max:500',
        ]);

        $transaction = LoanRepaymentTransaction::with('application')->findOrFail($transactionId);
        $application = $transaction->application;

        DB::beginTransaction();
        try {
            $transaction->status = $validated['status'];
            $transaction->verified_by_user_id = $user->id;
            $transaction->verified_at = Carbon::now();
            $transaction->admin_remarks = $validated['remarks'] ?? null;
            $transaction->save();

            $installments = $transaction->installments_covered ?? [];

            if ($validated['status'] === 'verified') {
                // Mark installments as paid
                LoanRepaymentSchedule::where('application_id', $application->id)
                    ->whereIn('installment_number', $installments)
                    ->update([
                        'status' => 'paid',
                        'paid_amount' => DB::raw('emi_amount'),
                        'paid_at' => $transaction->paid_at ?? Carbon::now(),
                        'utr_number' => $transaction->utr_number,
                        'receipt_path' => $transaction->receipt_path,
                    ]);

                // Check if all installments are paid or it was a full foreclosure
                $unpaidCount = LoanRepaymentSchedule::where('application_id', $application->id)
                    ->where('status', '!=', 'paid')
                    ->count();

                if ($unpaidCount === 0 || $transaction->repayment_type === 'foreclosure') {
                    // Mark any remaining as paid if foreclosure
                    if ($transaction->repayment_type === 'foreclosure') {
                        LoanRepaymentSchedule::where('application_id', $application->id)
                            ->where('status', '!=', 'paid')
                            ->update([
                                'status' => 'paid',
                                'paid_amount' => DB::raw('emi_amount'),
                                'paid_at' => Carbon::now(),
                                'utr_number' => $transaction->utr_number,
                            ]);
                    }

                    $application->current_status = LoanStatus::CLOSED;
                    $application->save();

                    AuditService::log(
                        'loan_closed_noc_issued',
                        'LoanApplication',
                        $application->id,
                        null,
                        ['reason' => 'Full loan repayment verified'],
                        $user->id
                    );
                }

                AuditService::log(
                    'repayment_verified',
                    'LoanRepaymentTransaction',
                    $transaction->id,
                    null,
                    ['amount' => $transaction->amount, 'installments' => $installments],
                    $user->id
                );
            } else {
                // Revert installments back to pending
                LoanRepaymentSchedule::where('application_id', $application->id)
                    ->whereIn('installment_number', $installments)
                    ->update(['status' => 'pending']);

                AuditService::log(
                    'repayment_rejected',
                    'LoanRepaymentTransaction',
                    $transaction->id,
                    null,
                    ['reason' => $validated['remarks']],
                    $user->id
                );
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => $validated['status'] === 'verified' 
                    ? 'Repayment successfully verified and credited to loan ledger!' 
                    : 'Repayment marked as rejected.',
                'transaction' => $transaction,
                'is_loan_closed' => $application->current_status === LoanStatus::CLOSED,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to process verification: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Staff records offline cash or direct bank wire EMI repayment
     */
    public function recordManualRepayment(Request $request, int $applicationId): JsonResponse
    {
        $user = $request->user();
        if (!$user->isStaff()) {
            abort(403, 'Unauthorized.');
        }

        $validated = $request->validate([
            'repayment_type' => 'required|string|in:single_emi,multi_emi,foreclosure,custom',
            'months_count' => 'nullable|integer|min:1|max:60',
            'amount' => 'required|numeric|min:1',
            'payment_method' => 'required|string|in:cash,bank_wire,cheque,offline_pos',
            'reference_number' => 'required|string|max:100',
            'remarks' => 'nullable|string|max:500',
        ]);

        $application = LoanApplication::findOrFail($applicationId);

        // Auto generate schedule if missing
        if ($application->repaymentSchedules()->count() === 0) {
            self::generateScheduleForApplication($application);
        }

        $monthsCount = (int)($validated['months_count'] ?? 1);
        $pendingSchedules = $application->repaymentSchedules()
            ->where('status', '!=', 'paid')
            ->orderBy('installment_number')
            ->get();

        $installmentsCovered = [];
        if ($validated['repayment_type'] === 'foreclosure') {
            $installmentsCovered = $pendingSchedules->pluck('installment_number')->toArray();
        } else {
            $targetCount = min($monthsCount, $pendingSchedules->count());
            $installmentsCovered = $pendingSchedules->take($targetCount)->pluck('installment_number')->toArray();
        }

        $txnNumber = 'TXN-MAN-' . date('Ymd') . '-' . strtoupper(Str::random(8));

        DB::beginTransaction();
        try {
            $transaction = LoanRepaymentTransaction::create([
                'application_id' => $application->id,
                'user_id' => $application->user_id,
                'transaction_number' => $txnNumber,
                'repayment_type' => $validated['repayment_type'],
                'installments_covered' => $installmentsCovered,
                'months_count' => count($installmentsCovered),
                'amount' => $validated['amount'],
                'payment_method' => $validated['payment_method'],
                'utr_number' => $validated['reference_number'],
                'status' => 'verified',
                'verified_by_user_id' => $user->id,
                'verified_at' => Carbon::now(),
                'paid_at' => Carbon::now(),
                'admin_remarks' => $validated['remarks'] ?? 'Offline manual collection',
            ]);

            LoanRepaymentSchedule::where('application_id', $application->id)
                ->whereIn('installment_number', $installmentsCovered)
                ->update([
                    'status' => 'paid',
                    'paid_amount' => DB::raw('emi_amount'),
                    'paid_at' => Carbon::now(),
                    'utr_number' => $validated['reference_number'],
                ]);

            $unpaidCount = LoanRepaymentSchedule::where('application_id', $application->id)
                ->where('status', '!=', 'paid')
                ->count();

            if ($unpaidCount === 0 || $validated['repayment_type'] === 'foreclosure') {
                $application->current_status = LoanStatus::CLOSED;
                $application->save();
            }

            AuditService::log(
                'manual_repayment_recorded',
                'LoanRepaymentTransaction',
                $transaction->id,
                null,
                ['amount' => $transaction->amount, 'method' => $validated['payment_method']],
                $user->id
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Manual repayment successfully recorded and credited to ledger!',
                'transaction' => $transaction,
                'is_loan_closed' => $application->current_status === LoanStatus::CLOSED,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to record manual payment: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Global staff repayments directory & collections queue
     */
    public function staffRepaymentsList(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->isStaff()) {
            abort(403, 'Unauthorized.');
        }

        $query = LoanRepaymentTransaction::with(['application.user', 'application.product', 'verifiedBy'])
            ->latest();

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('transaction_number', 'like', "%{$search}%")
                  ->orWhere('utr_number', 'like', "%{$search}%")
                  ->orWhereHas('application.user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                  });
            });
        }

        $transactions = $query->paginate(20);

        // Aggregate collection metrics
        $totalCollected = (float)LoanRepaymentTransaction::where('status', 'verified')->sum('amount');
        $pendingVerificationCount = LoanRepaymentTransaction::where('status', 'pending_verification')->count();

        return response()->json([
            'success' => true,
            'metrics' => [
                'total_collected_amount' => $totalCollected,
                'pending_verification_count' => $pendingVerificationCount,
            ],
            'data' => $transactions->items(),
            'meta' => [
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
                'total' => $transactions->total(),
            ]
        ]);
    }
}
