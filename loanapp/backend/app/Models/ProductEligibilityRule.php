<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductEligibilityRule extends Model
{
    protected $fillable = [
        'product_id',
        'min_age',
        'max_age',
        'min_monthly_income',
        'min_credit_score',
        'allowed_employment_types',
        'max_dti_ratio',
        'rules_json',
    ];

    protected $casts = [
        'min_age' => 'integer',
        'max_age' => 'integer',
        'min_monthly_income' => 'decimal:2',
        'min_credit_score' => 'integer',
        'allowed_employment_types' => 'array',
        'max_dti_ratio' => 'decimal:2',
        'rules_json' => 'array',
    ];

    public function product()
    {
        return $this->belongsTo(LoanProduct::class, 'product_id');
    }
}
