<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('information_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('loan_applications')->cascadeOnDelete();
            $table->foreignId('requested_by_user_id')->constrained('users')->cascadeOnDelete();
            $table->text('message');
            $table->string('status')->default('open'); // open, responded, closed
            $table->text('response_text')->nullable();
            $table->timestamp('responded_at')->nullable();
            $table->timestamps();
        });

        Schema::create('assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('loan_applications')->cascadeOnDelete();
            $table->foreignId('assessor_user_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('calculated_income', 12, 2)->default(0.00);
            $table->decimal('total_obligations', 12, 2)->default(0.00);
            $table->decimal('dti_ratio', 5, 2)->default(0.00);
            $table->integer('risk_score')->default(700);
            $table->decimal('recommended_amount', 12, 2);
            $table->integer('recommended_tenure_months');
            $table->decimal('recommended_rate', 5, 2);
            $table->text('remarks')->nullable();
            $table->timestamps();
        });

        Schema::create('decisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('loan_applications')->cascadeOnDelete();
            $table->foreignId('decider_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('decision'); // approved, rejected, returned
            $table->decimal('approved_amount', 12, 2)->nullable();
            $table->integer('approved_tenure_months')->nullable();
            $table->decimal('approved_rate', 5, 2)->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('decisions');
        Schema::dropIfExists('assessments');
        Schema::dropIfExists('information_requests');
    }
};
