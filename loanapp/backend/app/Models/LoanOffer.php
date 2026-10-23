<?php

namespace App\Models;

use App\Enums\OfferStatus;
use Illuminate\Database\Eloquent\Model;

class LoanOffer extends Model
{
    protected $fillable = [
        'application_id',
        'offer_number',
        'approved_amount',
        'approved_tenure_months',
        'interest_rate',
        'emi_amount',
        'processing_fee',
        'total_payable',
        'status',
        'issued_at',
        'expires_at',
        'accepted_at',
        'declined_at',
        'decline_reason',
        'remarks',
    ];

    protected $casts = [
        'approved_amount' => 'decimal:2',
        'approved_tenure_months' => 'integer',
        'interest_rate' => 'decimal:2',
        'emi_amount' => 'decimal:2',
        'processing_fee' => 'decimal:2',
        'total_payable' => 'decimal:2',
        'status' => OfferStatus::class,
        'issued_at' => 'datetime',
        'expires_at' => 'datetime',
        'accepted_at' => 'datetime',
        'declined_at' => 'datetime',
    ];

    public function application()
    {
        return $this->belongsTo(LoanApplication::class, 'application_id');
    }

    public function formality()
    {
        return $this->hasOne(Formality::class, 'offer_id');
    }
}
