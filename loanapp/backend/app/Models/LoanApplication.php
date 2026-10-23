<?php

namespace App\Models;

use App\Enums\LoanStatus;
use Illuminate\Database\Eloquent\Model;

class LoanApplication extends Model
{
    protected $fillable = [
        'application_number',
        'user_id',
        'product_id',
        'requested_amount',
        'requested_tenure_months',
        'purpose',
        'current_status',
        'current_step',
        'assigned_to_user_id',
        'submitted_at',
        'approved_amount',
        'approved_tenure_months',
        'approved_interest_rate',
        'rejection_reason',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'requested_amount' => 'decimal:2',
        'requested_tenure_months' => 'integer',
        'current_step' => 'integer',
        'approved_amount' => 'decimal:2',
        'approved_tenure_months' => 'integer',
        'approved_interest_rate' => 'decimal:2',
        'current_status' => LoanStatus::class,
        'submitted_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function product()
    {
        return $this->belongsTo(LoanProduct::class, 'product_id');
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to_user_id');
    }

    public function personalDetails()
    {
        return $this->hasOne(ApplicationPersonalDetail::class, 'application_id');
    }

    public function employmentDetails()
    {
        return $this->hasOne(ApplicationEmploymentDetail::class, 'application_id');
    }

    public function businessDetails()
    {
        return $this->hasOne(ApplicationBusinessDetail::class, 'application_id');
    }

    public function financialDetails()
    {
        return $this->hasOne(ApplicationFinancialDetail::class, 'application_id');
    }

    public function documents()
    {
        return $this->hasMany(ApplicationDocument::class, 'application_id');
    }

    public function informationRequests()
    {
        return $this->hasMany(InformationRequest::class, 'application_id');
    }

    public function assessment()
    {
        return $this->hasOne(Assessment::class, 'application_id');
    }

    public function decision()
    {
        return $this->hasOne(Decision::class, 'application_id');
    }

    public function offer()
    {
        return $this->hasOne(LoanOffer::class, 'application_id');
    }

    public function formalities()
    {
        return $this->hasOne(Formality::class, 'application_id');
    }

    public function paymentRecord()
    {
        return $this->hasOne(PaymentRecord::class, 'application_id');
    }

    public function disbursementRecord()
    {
        return $this->hasOne(DisbursementRecord::class, 'application_id');
    }

    public function statusHistory()
    {
        return $this->hasMany(ApplicationStatusHistory::class, 'application_id')->latest();
    }

    public function internalNotes()
    {
        return $this->hasMany(InternalNote::class, 'application_id')->latest();
    }

    public function creditAssessment()
    {
        return $this->hasOne(Assessment::class, 'application_id');
    }

    public function notes()
    {
        return $this->hasMany(InternalNote::class, 'application_id')->latest();
    }

    public function repaymentSchedules()
    {
        return $this->hasMany(LoanRepaymentSchedule::class, 'application_id')->orderBy('installment_number');
    }

    public function repaymentTransactions()
    {
        return $this->hasMany(LoanRepaymentTransaction::class, 'application_id')->latest();
    }
}


