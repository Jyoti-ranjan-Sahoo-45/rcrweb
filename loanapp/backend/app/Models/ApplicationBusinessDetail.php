<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApplicationBusinessDetail extends Model
{
    protected $fillable = [
        'application_id',
        'business_name',
        'business_type',
        'registration_number',
        'annual_turnover',
        'business_vintage_years',
        'business_address',
    ];

    protected $casts = [
        'annual_turnover' => 'decimal:2',
        'business_vintage_years' => 'decimal:1',
    ];

    public function application()
    {
        return $this->belongsTo(LoanApplication::class, 'application_id');
    }
}
