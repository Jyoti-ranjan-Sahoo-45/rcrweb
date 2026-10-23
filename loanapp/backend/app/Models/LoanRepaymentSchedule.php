<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LoanRepaymentSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'application_id',
        'installment_number',
        'due_date',
        'emi_amount',
        'principal_component',
        'interest_component',
        'remaining_principal',
        'status',
        'paid_amount',
        'paid_at',
        'utr_number',
        'receipt_path',
    ];

    protected $casts = [
        'due_date' => 'date',
        'emi_amount' => 'decimal:2',
        'principal_component' => 'decimal:2',
        'interest_component' => 'decimal:2',
        'remaining_principal' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    protected $appends = ['receipt_url'];

    public function application()
    {
        return $this->belongsTo(LoanApplication::class, 'application_id');
    }

    public function getReceiptUrlAttribute(): ?string
    {
        if (!$this->receipt_path) {
            return null;
        }
        return url('/storage/' . $this->receipt_path);
    }
}
