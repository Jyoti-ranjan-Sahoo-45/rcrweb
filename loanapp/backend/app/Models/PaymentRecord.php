<?php

namespace App\Models;

use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Model;

class PaymentRecord extends Model
{
    protected $fillable = [
        'application_id',
        'transaction_id',
        'utr_number',
        'payment_type',
        'amount',
        'status',
        'payment_method',
        'gateway_reference',
        'receipt_path',
        'verified_by_user_id',
        'verification_remarks',
        'paid_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'status' => PaymentStatus::class,
        'paid_at' => 'datetime',
    ];

    protected $appends = ['receipt_url'];

    public function getReceiptUrlAttribute(): ?string
    {
        if (!$this->receipt_path) {
            return null;
        }
        return asset('storage/' . $this->receipt_path);
    }

    public function application()
    {
        return $this->belongsTo(LoanApplication::class, 'application_id');
    }

    public function verifiedBy()
    {
        return $this->belongsTo(User::class, 'verified_by_user_id');
    }
}

