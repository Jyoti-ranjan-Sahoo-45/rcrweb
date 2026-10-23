<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Formality extends Model
{
    protected $fillable = [
        'application_id',
        'offer_id',
        'kfs_document_path',
        'agreement_document_path',
        'is_acknowledged',
        'customer_signed_at',
        'customer_ip',
        'status',
    ];

    protected $casts = [
        'is_acknowledged' => 'boolean',
        'customer_signed_at' => 'datetime',
    ];

    public function application()
    {
        return $this->belongsTo(LoanApplication::class, 'application_id');
    }

    public function offer()
    {
        return $this->belongsTo(LoanOffer::class, 'offer_id');
    }
}
