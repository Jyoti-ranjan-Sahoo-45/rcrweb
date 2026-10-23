<?php

namespace App\Enums;

enum UserRole: string
{
    case CUSTOMER = 'customer';
    case SUPER_ADMIN = 'super_admin';
    case APPLICATION_EXECUTIVE = 'application_executive';
    case VERIFICATION_EXECUTIVE = 'verification_executive';
    case CREDIT_EXECUTIVE = 'credit_executive';
    case CREDIT_MANAGER = 'credit_manager';
    case FINANCE_EXECUTIVE = 'finance_executive';
    case OPERATIONS_EXECUTIVE = 'operations_executive';
    case MANAGER = 'manager';

    public function isStaff(): bool
    {
        return $this !== self::CUSTOMER;
    }

    public function label(): string
    {
        return match ($this) {
            self::CUSTOMER => 'Customer',
            self::SUPER_ADMIN => 'Super Administrator',
            self::APPLICATION_EXECUTIVE => 'Application Executive',
            self::VERIFICATION_EXECUTIVE => 'Verification Executive',
            self::CREDIT_EXECUTIVE => 'Credit Executive',
            self::CREDIT_MANAGER => 'Credit Manager / Approver',
            self::FINANCE_EXECUTIVE => 'Finance Executive',
            self::OPERATIONS_EXECUTIVE => 'Operations Executive',
            self::MANAGER => 'General Manager',
        };
    }
}
