<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LoanRepaymentTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'application_id',
        'user_id',
        'transaction_number',
        'repayment_type',
        'installments_covered',
        'months_count',
        'amount',
        'payment_method',
        'utr_number',
        'receipt_path',
        'status',
        'verified_by_user_id',
        'verified_at',
        'paid_at',
        'admin_remarks',
    ];

    protected $casts = [
        'installments_covered' => 'array',
        'months_count' => 'integer',
        'amount' => 'decimal:2',
        'verified_at' => 'datetime',
        'paid_at' => 'datetime',
    ];

    protected $appends = ['receipt_url'];

    public function application()
    {
        return $this->belongsTo(LoanApplication::class, 'application_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function verifiedBy()
    {
        return $this->belongsTo(User::class, 'verified_by_user_id');
    }

    public function getReceiptUrlAttribute(): ?string
    {
        if (!$this->receipt_path) {
            return null;
        }
        return url('/storage/' . $this->receipt_path);
    }
}
