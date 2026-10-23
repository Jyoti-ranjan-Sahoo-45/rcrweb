<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApplicationEmploymentDetail extends Model
{
    protected $fillable = [
        'application_id',
        'employment_type',
        'employer_name',
        'designation',
        'monthly_income',
        'work_experience_years',
        'official_email',
        'office_address',
    ];

    protected $casts = [
        'monthly_income' => 'decimal:2',
        'work_experience_years' => 'decimal:1',
    ];

    public function application()
    {
        return $this->belongsTo(LoanApplication::class, 'application_id');
    }
}
