<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loan_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('icon')->default('Briefcase');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('display_order')->default(0);
            $table->timestamps();
        });

        Schema::create('loan_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('loan_categories')->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('code', 30)->unique();
            $table->text('description')->nullable();
            $table->decimal('min_amount', 12, 2)->default(10000.00);
            $table->decimal('max_amount', 12, 2)->default(1000000.00);
            $table->integer('min_tenure_months')->default(6);
            $table->integer('max_tenure_months')->default(60);
            $table->integer('default_tenure_months')->default(24);
            $table->decimal('min_interest_rate', 5, 2)->default(10.50);
            $table->decimal('max_interest_rate', 5, 2)->default(24.00);
            $table->decimal('default_interest_rate', 5, 2)->default(14.00);
            $table->decimal('processing_fee_pct', 5, 2)->default(2.00);
            $table->decimal('min_processing_fee', 10, 2)->default(500.00);
            $table->string('icon')->default('Coins');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('product_eligibility_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('loan_products')->cascadeOnDelete();
            $table->integer('min_age')->default(21);
            $table->integer('max_age')->default(60);
            $table->decimal('min_monthly_income', 12, 2)->default(20000.00);
            $table->integer('min_credit_score')->default(650);
            $table->json('allowed_employment_types')->nullable(); // ['salaried', 'self_employed', 'business']
            $table->decimal('max_dti_ratio', 5, 2)->default(50.00);
            $table->json('rules_json')->nullable();
            $table->timestamps();
        });

        Schema::create('product_document_requirements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('loan_products')->cascadeOnDelete();
            $table->string('document_type'); // pan_card, aadhaar_card, salary_slip, bank_statement, itr, business_proof
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_mandatory')->default(true);
            $table->integer('max_size_mb')->default(10);
            $table->json('allowed_formats')->nullable(); // ['pdf', 'jpeg', 'png']
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_document_requirements');
        Schema::dropIfExists('product_eligibility_rules');
        Schema::dropIfExists('loan_products');
        Schema::dropIfExists('loan_categories');
    }
};
