<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoanCategory extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'icon',
        'description',
        'is_active',
        'display_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'display_order' => 'integer',
    ];

    public function products()
    {
        return $this->hasMany(LoanProduct::class, 'category_id');
    }
}
