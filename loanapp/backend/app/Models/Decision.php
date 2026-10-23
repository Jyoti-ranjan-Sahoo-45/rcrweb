<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Decision extends Model
{
    protected $fillable = [
        'application_id',
        'decider_user_id',
        'decision',
        'approved_amount',
        'approved_tenure_months',
        'approved_rate',
        'remarks',
    ];

    protected $casts = [
        'approved_amount' => 'decimal:2',
        'approved_tenure_months' => 'integer',
        'approved_rate' => 'decimal:2',
    ];

    public function application()
    {
        return $this->belongsTo(LoanApplication::class, 'application_id');
    }

    public function decider()
    {
        return $this->belongsTo(User::class, 'decider_user_id');
    }
}
