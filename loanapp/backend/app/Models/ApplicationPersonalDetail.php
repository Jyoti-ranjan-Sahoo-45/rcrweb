<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApplicationPersonalDetail extends Model
{
    protected $fillable = [
        'application_id',
        'full_name',
        'first_name',
        'last_name',
        'email',
        'phone',
        'dob',
        'gender',
        'marital_status',
        'current_address_line1',
        'current_address_line2',
        'current_city',
        'current_state',
        'current_pincode',
        'permanent_address_line1',
        'permanent_city',
        'permanent_state',
        'permanent_pincode',
        'pan_number',
        'aadhaar_number',
        'father_husband_name',
        'residence_type',
        'years_at_current_address',
        'reference_name',
        'reference_phone',
        'reference_relationship',
        'declaration_accepted',
    ];

    protected $casts = [
        'dob' => 'date',
        'declaration_accepted' => 'boolean',
    ];

    public function application()
    {
        return $this->belongsTo(LoanApplication::class, 'application_id');
    }
}
