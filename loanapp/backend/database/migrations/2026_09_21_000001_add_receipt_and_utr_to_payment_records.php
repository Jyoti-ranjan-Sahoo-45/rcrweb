<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payment_records', function (Blueprint $table) {
            if (!Schema::hasColumn('payment_records', 'receipt_path')) {
                $table->string('receipt_path')->nullable()->after('gateway_reference');
            }
            if (!Schema::hasColumn('payment_records', 'utr_number')) {
                $table->string('utr_number')->nullable()->after('transaction_id');
            }
            if (!Schema::hasColumn('payment_records', 'verification_remarks')) {
                $table->text('verification_remarks')->nullable()->after('verified_by_user_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('payment_records', function (Blueprint $table) {
            $table->dropColumn(['receipt_path', 'utr_number', 'verification_remarks']);
        });
    }
};
