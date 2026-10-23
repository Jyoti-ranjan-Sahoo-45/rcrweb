<?php

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;

Route::get('/{any?}', function () {
    $indexPath = public_path('index.html');
    if (File::exists($indexPath)) {
        return File::get($indexPath);
    }
    return response()->json([
        'status' => 'ok',
        'message' => 'RCR Digital Loan API is live. React frontend building...',
    ]);
})->where('any', '^(?!api|storage).*$');
