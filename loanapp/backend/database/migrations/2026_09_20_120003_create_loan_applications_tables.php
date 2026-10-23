<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loan_applications', function (Blueprint $table) {
            $table->id();
            $table->string('application_number', 40)->unique();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('loan_products')->restrictOnDelete();
            $table->decimal('requested_amount', 12, 2);
            $table->integer('requested_tenure_months');
            $table->string('purpose')->nullable();
            $table->string('current_status')->default('draft'); // draft, submitted, initial_review, documents_pending, document_verification, additional_information_required, eligibility_review, credit_assessment, approval_pending, approved, rejected, offer_preparation, offer_sent, offer_accepted, offer_declined, offer_expired, agreement_pending, payment_pending, payment_verification, ready_for_disbursement, disbursement_processing, disbursed, cancelled, closed
            $table->foreignId('assigned_to_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('submitted_at')->nullable();
            $table->decimal('approved_amount', 12, 2)->nullable();
            $table->integer('approved_tenure_months')->nullable();
            $table->decimal('approved_interest_rate', 5, 2)->nullable();
            $table->text('rejection_reason')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();

            $table->index('current_status');
            $table->index('user_id');
            $table->index('assigned_to_user_id');
        });

        Schema::create('application_personal_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('loan_applications')->cascadeOnDelete();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email');
            $table->string('phone', 20);
            $table->date('dob')->nullable();
            $table->string('gender', 20)->nullable();
            $table->string('marital_status', 20)->nullable();
            $table->string('current_address_line1')->nullable();
            $table->string('current_address_line2')->nullable();
            $table->string('current_city')->nullable();
            $table->string('current_state')->nullable();
            $table->string('current_pincode', 10)->nullable();
            $table->string('permanent_address_line1')->nullable();
            $table->string('permanent_city')->nullable();
            $table->string('permanent_state')->nullable();
            $table->string('permanent_pincode', 10)->nullable();
            $table->string('pan_number', 20)->nullable();
            $table->string('aadhaar_number', 20)->nullable();
            $table->timestamps();
        });

        Schema::create('application_employment_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('loan_applications')->cascadeOnDelete();
            $table->string('employment_type'); // salaried, self_employed, business, other
            $table->string('employer_name')->nullable();
            $table->string('designation')->nullable();
            $table->decimal('monthly_income', 12, 2)->default(0.00);
            $table->decimal('work_experience_years', 4, 1)->default(0.0);
            $table->string('official_email')->nullable();
            $table->text('office_address')->nullable();
            $table->timestamps();
        });

        Schema::create('application_business_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('loan_applications')->cascadeOnDelete();
            $table->string('business_name')->nullable();
            $table->string('business_type')->nullable(); // sole_proprietorship, partnership, pvt_ltd, llp
            $table->string('registration_number')->nullable();
            $table->decimal('annual_turnover', 14, 2)->default(0.00);
            $table->decimal('business_vintage_years', 4, 1)->default(0.0);
            $table->text('business_address')->nullable();
            $table->timestamps();
        });

        Schema::create('application_financial_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('loan_applications')->cascadeOnDelete();
            $table->decimal('monthly_expenses', 12, 2)->default(0.00);
            $table->decimal('existing_emi_obligations', 12, 2)->default(0.00);
            $table->string('primary_bank_name')->nullable();
            $table->string('account_holder_name')->nullable();
            $table->string('account_number')->nullable();
            $table->string('ifsc_code', 20)->nullable();
            $table->string('account_type', 30)->default('savings');
            $table->timestamps();
        });

        Schema::create('application_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('loan_applications')->cascadeOnDelete();
            $table->foreignId('requirement_id')->nullable()->constrained('product_document_requirements')->nullOnDelete();
            $table->string('document_type');
            $table->string('file_path');
            $table->string('original_filename');
            $table->string('mime_type')->nullable();
            $table->integer('file_size')->default(0);
            $table->string('status')->default('pending'); // pending, verified, rejected
            $table->foreignId('verified_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->integer('version')->default(1);
            $table->timestamps();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('application_documents');
        Schema::dropIfExists('application_financial_details');
        Schema::dropIfExists('application_business_details');
        Schema::dropIfExists('application_employment_details');
        Schema::dropIfExists('application_personal_details');
        Schema::dropIfExists('loan_applications');
    }
};
