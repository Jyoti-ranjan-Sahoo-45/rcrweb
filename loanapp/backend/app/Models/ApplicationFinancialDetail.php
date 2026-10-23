<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApplicationFinancialDetail extends Model
{
    protected $fillable = [
        'application_id',
        'monthly_expenses',
        'existing_emi_obligations',
        'primary_bank_name',
        'account_holder_name',
        'account_number',
        'ifsc_code',
        'account_type',
    ];

    protected $casts = [
        'monthly_expenses' => 'decimal:2',
        'existing_emi_obligations' => 'decimal:2',
    ];

    public function application()
    {
        return $this->belongsTo(LoanApplication::class, 'application_id');
    }
}
