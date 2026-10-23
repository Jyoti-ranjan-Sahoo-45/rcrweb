<?php

namespace App\Enums;

enum DisbursementStatus: string
{
    case PENDING = 'pending';
    case PROCESSING = 'processing';
    case DISBURSED = 'disbursed';
    case FAILED = 'failed';
}
