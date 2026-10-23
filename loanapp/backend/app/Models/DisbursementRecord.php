<?php

namespace App\Models;

use App\Enums\DisbursementStatus;
use Illuminate\Database\Eloquent\Model;

class DisbursementRecord extends Model
{
    protected $fillable = [
        'application_id',
        'payment_record_id',
        'disbursement_number',
        'amount',
        'bank_name',
        'account_number',
        'ifsc_code',
        'transaction_reference',
        'status',
        'checklist_passed',
        'checklist_data',
        'disbursed_by_user_id',
        'disbursed_at',
        'failure_reason',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'status' => DisbursementStatus::class,
        'checklist_passed' => 'boolean',
        'checklist_data' => 'array',
        'disbursed_at' => 'datetime',
    ];

    public function application()
    {
        return $this->belongsTo(LoanApplication::class, 'application_id');
    }

    public function paymentRecord()
    {
        return $this->belongsTo(PaymentRecord::class, 'payment_record_id');
    }

    public function disbursedBy()
    {
        return $this->belongsTo(User::class, 'disbursed_by_user_id');
    }
}
