<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Assessment extends Model
{
    protected $fillable = [
        'application_id',
        'assessor_user_id',
        'calculated_income',
        'total_obligations',
        'dti_ratio',
        'risk_score',
        'recommended_amount',
        'recommended_tenure_months',
        'recommended_rate',
        'remarks',
    ];

    protected $casts = [
        'calculated_income' => 'decimal:2',
        'total_obligations' => 'decimal:2',
        'dti_ratio' => 'decimal:2',
        'risk_score' => 'integer',
        'recommended_amount' => 'decimal:2',
        'recommended_tenure_months' => 'integer',
        'recommended_rate' => 'decimal:2',
    ];

    public function application()
    {
        return $this->belongsTo(LoanApplication::class, 'application_id');
    }

    public function assessor()
    {
        return $this->belongsTo(User::class, 'assessor_user_id');
    }
}
