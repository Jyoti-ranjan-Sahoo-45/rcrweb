<?php

namespace App\Models;

use App\Enums\DocumentStatus;
use Illuminate\Database\Eloquent\Model;

class ApplicationDocument extends Model
{
    protected $fillable = [
        'application_id',
        'requirement_id',
        'document_type',
        'file_path',
        'original_filename',
        'mime_type',
        'file_size',
        'status',
        'verified_by_user_id',
        'verified_at',
        'rejection_reason',
        'version',
    ];

    protected $casts = [
        'status' => DocumentStatus::class,
        'verified_at' => 'datetime',
        'file_size' => 'integer',
        'version' => 'integer',
    ];

    public function application()
    {
        return $this->belongsTo(LoanApplication::class, 'application_id');
    }

    public function requirement()
    {
        return $this->belongsTo(ProductDocumentRequirement::class, 'requirement_id');
    }

    public function verifiedBy()
    {
        return $this->belongsTo(User::class, 'verified_by_user_id');
    }
}
