<?php

namespace App\Models;

use App\Enums\LoanStatus;
use Illuminate\Database\Eloquent\Model;

class ApplicationStatusHistory extends Model
{
    public $timestamps = false;
    protected $table = 'application_status_history';

    protected $fillable = [
        'application_id',
        'from_status',
        'to_status',
        'changed_by_user_id',
        'remarks',
        'created_at',
    ];

    protected $casts = [
        'from_status' => LoanStatus::class,
        'to_status' => LoanStatus::class,
        'created_at' => 'datetime',
    ];

    public function application()
    {
        return $this->belongsTo(LoanApplication::class, 'application_id');
    }

    public function changedBy()
    {
        return $this->belongsTo(User::class, 'changed_by_user_id');
    }
}
