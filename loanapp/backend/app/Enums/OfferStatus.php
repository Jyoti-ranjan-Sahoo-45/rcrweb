<?php

namespace App\Enums;

enum OfferStatus: string
{
    case ISSUED = 'issued';
    case ACCEPTED = 'accepted';
    case DECLINED = 'declined';
    case EXPIRED = 'expired';
}
