<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductDocumentRequirement extends Model
{
    protected $fillable = [
        'product_id',
        'document_type',
        'name',
        'description',
        'is_mandatory',
        'max_size_mb',
        'allowed_formats',
    ];

    protected $casts = [
        'is_mandatory' => 'boolean',
        'max_size_mb' => 'integer',
        'allowed_formats' => 'array',
    ];

    public function product()
    {
        return $this->belongsTo(LoanProduct::class, 'product_id');
    }
}
