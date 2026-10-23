<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loan_repayment_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('loan_applications')->cascadeOnDelete();
            $table->integer('installment_number');
            $table->date('due_date');
            $table->decimal('emi_amount', 12, 2);
            $table->decimal('principal_component', 12, 2)->default(0);
            $table->decimal('interest_component', 12, 2)->default(0);
            $table->decimal('remaining_principal', 12, 2)->default(0);
            $table->string('status', 30)->default('pending'); // pending, processing_verification, paid, overdue
            $table->decimal('paid_amount', 12, 2)->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->string('utr_number', 100)->nullable();
            $table->string('receipt_path')->nullable();
            $table->timestamps();

            $table->index(['application_id', 'installment_number']);
            $table->index('status');
            $table->index('due_date');
        });

        Schema::create('loan_repayment_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('loan_applications')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('transaction_number', 50)->unique();
            $table->string('repayment_type', 30)->default('single_emi'); // single_emi, multi_emi, foreclosure, custom, offline_manual
            $table->json('installments_covered')->nullable(); // e.g. [1, 2]
            $table->integer('months_count')->default(1);
            $table->decimal('amount', 12, 2);
            $table->string('payment_method', 30)->default('upi_qr'); // upi_qr, bank_transfer, cash, offline
            $table->string('utr_number', 100);
            $table->string('receipt_path')->nullable();
            $table->string('status', 30)->default('pending_verification'); // pending_verification, verified, rejected
            $table->foreignId('verified_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->text('admin_remarks')->nullable();
            $table->timestamps();

            $table->index(['application_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loan_repayment_transactions');
        Schema::dropIfExists('loan_repayment_schedules');
    }
};
