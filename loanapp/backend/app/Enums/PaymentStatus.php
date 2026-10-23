<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case PENDING = 'pending';
    case PENDING_VERIFICATION = 'pending_verification';
    case COMPLETED = 'completed';
    case FAILED = 'failed';
    case VERIFIED = 'verified';
}

