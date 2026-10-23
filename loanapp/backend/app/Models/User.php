<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role',
        'role_id',
        'custom_permissions',
        'status',
        'avatar_url',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = [
        'effective_permissions',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
            'custom_permissions' => 'array',
        ];
    }

    public function isStaff(): bool
    {
        return $this->role !== UserRole::CUSTOMER;
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === UserRole::SUPER_ADMIN;
    }

    public function applications()
    {
        return $this->hasMany(LoanApplication::class, 'user_id');
    }

    public function assignedApplications()
    {
        return $this->hasMany(LoanApplication::class, 'assigned_to_user_id');
    }

    public function roleRecord()
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    public function getEffectivePermissionsAttribute(): array
    {
        if ($this->role === UserRole::SUPER_ADMIN) {
            return Permission::pluck('name')->toArray();
        }

        $rolePerms = [];
        if ($this->role_id && $this->relationLoaded('roleRecord')) {
            $rolePerms = $this->roleRecord ? $this->roleRecord->permissions->pluck('name')->toArray() : [];
        } elseif ($this->role_id) {
            $roleRecord = Role::with('permissions')->find($this->role_id);
            $rolePerms = $roleRecord ? $roleRecord->permissions->pluck('name')->toArray() : [];
        }

        $customPerms = is_array($this->custom_permissions) 
            ? $this->custom_permissions 
            : (json_decode($this->custom_permissions ?? '', true) ?: []);

        return array_values(array_unique(array_merge($rolePerms, $customPerms)));
    }

    public function hasPermission(string $permission): bool
    {
        if ($this->role === UserRole::SUPER_ADMIN) {
            return true;
        }
        return in_array($permission, $this->effective_permissions, true);
    }
}
