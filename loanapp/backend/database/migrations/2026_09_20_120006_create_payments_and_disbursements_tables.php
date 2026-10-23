<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('loan_applications')->cascadeOnDelete();
            $table->string('transaction_id', 50)->unique();
            $table->string('payment_type')->default('processing_fee'); // processing_fee, advance_emi, administrative_fee
            $table->decimal('amount', 12, 2);
            $table->string('status')->default('pending'); // pending, completed, failed, verified
            $table->string('payment_method')->nullable(); // upi, net_banking, card, mock
            $table->string('gateway_reference')->nullable();
            $table->foreignId('verified_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index('status');
        });

        Schema::create('disbursement_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('loan_applications')->cascadeOnDelete();
            $table->foreignId('payment_record_id')->nullable()->constrained('payment_records')->nullOnDelete();
            $table->string('disbursement_number', 50)->unique();
            $table->decimal('amount', 12, 2);
            $table->string('bank_name');
            $table->string('account_number');
            $table->string('ifsc_code', 20);
            $table->string('transaction_reference')->nullable();
            $table->string('status')->default('pending'); // pending, processing, disbursed, failed
            $table->boolean('checklist_passed')->default(false);
            $table->json('checklist_data')->nullable();
            $table->foreignId('disbursed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('disbursed_at')->nullable();
            $table->text('failure_reason')->nullable();
            $table->timestamps();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('disbursement_records');
        Schema::dropIfExists('payment_records');
    }
};
