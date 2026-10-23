<?php

namespace App\Services;

use App\Enums\LoanStatus;
use App\Models\ApplicationStatusHistory;
use App\Models\LoanApplication;
use App\Models\Notification;
use Exception;
use Illuminate\Support\Facades\DB;

class LoanStateMachine
{
    /**
     * Transition application to new status with authorization and prerequisite checks
     */
    public function transition(LoanApplication $application, LoanStatus $targetStatus, ?string $remarks = null, ?int $userId = null): LoanApplication
    {
        $currentStatus = $application->current_status;

        if ($currentStatus === $targetStatus) {
            return $application;
        }

        // Validate allowed transitions
        $allowedNext = $currentStatus->allowedNextStatuses();
        if (!in_array($targetStatus, $allowedNext, true)) {
            throw new Exception("Invalid status transition from '{$currentStatus->value}' to '{$targetStatus->value}'.");
        }

        // Enforce specific prerequisites
        $this->verifyPrerequisites($application, $targetStatus);

        return DB::transaction(function () use ($application, $currentStatus, $targetStatus, $remarks, $userId) {
            $application->update([
                'current_status' => $targetStatus,
            ]);

            ApplicationStatusHistory::create([
                'application_id' => $application->id,
                'from_status' => $currentStatus,
                'to_status' => $targetStatus,
                'changed_by_user_id' => $userId ?? auth()->id(),
                'remarks' => $remarks,
                'created_at' => now(),
            ]);

            AuditService::log(
                action: 'status_transition',
                entityType: 'LoanApplication',
                entityId: $application->id,
                oldValues: ['status' => $currentStatus->value],
                newValues: ['status' => $targetStatus->value, 'remarks' => $remarks],
                userId: $userId
            );

            // Trigger In-app Notification to customer
            Notification::create([
                'user_id' => $application->user_id,
                'title' => "Application Update ({$application->application_number})",
                'message' => "Your loan application status is now: " . $targetStatus->customerLabel(),
                'type' => $this->resolveNotificationType($targetStatus),
                'action_url' => "/applications/{$application->id}",
            ]);

            return $application->fresh();
        });
    }

    protected function verifyPrerequisites(LoanApplication $application, LoanStatus $targetStatus): void
    {
        if ($targetStatus === LoanStatus::SUBMITTED) {
            if (!$application->personalDetails || !$application->financialDetails) {
                throw new Exception("Incomplete application. Personal KYC and bank details are required before submission.");
            }
        }

        if ($targetStatus === LoanStatus::APPROVED) {
            if (!$application->assessment) {
                throw new Exception("Credit assessment must be completed before loan approval.");
            }
        }

        if ($targetStatus === LoanStatus::OFFER_SENT) {
            if (!$application->offer) {
                throw new Exception("Loan offer must be generated before sending offer to customer.");
            }
        }

        if ($targetStatus === LoanStatus::READY_FOR_DISBURSEMENT) {
            if ($application->formalities && !$application->formalities->is_acknowledged) {
                throw new Exception("Customer agreement and formalities must be completed before ready for disbursement.");
            }
        }

        if ($targetStatus === LoanStatus::DISBURSED) {
            if (!$application->disbursementRecord || !$application->disbursementRecord->checklist_passed) {
                throw new Exception("Pre-disbursement checklist must pass before marking loan as disbursed.");
            }
        }
    }

    protected function resolveNotificationType(LoanStatus $status): string
    {
        return match ($status) {
            LoanStatus::APPROVED, LoanStatus::OFFER_SENT, LoanStatus::DISBURSED => 'success',
            LoanStatus::REJECTED, LoanStatus::CANCELLED => 'danger',
            LoanStatus::ADDITIONAL_INFO_REQUIRED, LoanStatus::DOCUMENTS_PENDING, LoanStatus::PAYMENT_PENDING => 'warning',
            default => 'info',
        };
    }
}
