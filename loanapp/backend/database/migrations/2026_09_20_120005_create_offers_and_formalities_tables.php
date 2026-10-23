<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loan_offers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('loan_applications')->cascadeOnDelete();
            $table->string('offer_number', 40)->unique();
            $table->decimal('approved_amount', 12, 2);
            $table->integer('approved_tenure_months');
            $table->decimal('interest_rate', 5, 2);
            $table->decimal('emi_amount', 12, 2);
            $table->decimal('processing_fee', 10, 2)->default(0.00);
            $table->decimal('total_payable', 12, 2);
            $table->string('status')->default('issued'); // issued, accepted, declined, expired
            $table->timestamp('issued_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('declined_at')->nullable();
            $table->text('decline_reason')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->index('status');
        });

        Schema::create('formalities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('loan_applications')->cascadeOnDelete();
            $table->foreignId('offer_id')->constrained('loan_offers')->cascadeOnDelete();
            $table->string('kfs_document_path')->nullable();
            $table->string('agreement_document_path')->nullable();
            $table->boolean('is_acknowledged')->default(false);
            $table->timestamp('customer_signed_at')->nullable();
            $table->string('customer_ip', 45)->nullable();
            $table->string('status')->default('pending'); // pending, completed
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('formalities');
        Schema::dropIfExists('loan_offers');
    }
};
