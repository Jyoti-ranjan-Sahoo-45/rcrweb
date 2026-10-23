<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoanProduct extends Model
{
    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'code',
        'description',
        'min_amount',
        'max_amount',
        'min_tenure_months',
        'max_tenure_months',
        'default_tenure_months',
        'min_interest_rate',
        'max_interest_rate',
        'default_interest_rate',
        'processing_fee_pct',
        'min_processing_fee',
        'icon',
        'is_active',
    ];

    protected $casts = [
        'min_amount' => 'decimal:2',
        'max_amount' => 'decimal:2',
        'min_tenure_months' => 'integer',
        'max_tenure_months' => 'integer',
        'default_tenure_months' => 'integer',
        'min_interest_rate' => 'decimal:2',
        'max_interest_rate' => 'decimal:2',
        'default_interest_rate' => 'decimal:2',
        'processing_fee_pct' => 'decimal:2',
        'min_processing_fee' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(LoanCategory::class, 'category_id');
    }

    public function eligibilityRule()
    {
        return $this->hasOne(ProductEligibilityRule::class, 'product_id');
    }

    public function documentRequirements()
    {
        return $this->hasMany(ProductDocumentRequirement::class, 'product_id');
    }

    public function applications()
    {
        return $this->hasMany(LoanApplication::class, 'product_id');
    }
}
