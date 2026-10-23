<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\LoanCategory;
use App\Models\LoanProduct;
use App\Models\Permission;
use App\Models\ProductDocumentRequirement;
use App\Models\ProductEligibilityRule;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed Roles
        $roles = [
            ['name' => 'super_admin', 'display_name' => 'Super Administrator', 'description' => 'Full administrative privileges'],
            ['name' => 'application_executive', 'display_name' => 'Application Executive', 'description' => 'Reviews applications and requests info'],
            ['name' => 'verification_executive', 'display_name' => 'Verification Executive', 'description' => 'Inspects and verifies KYC and income docs'],
            ['name' => 'credit_executive', 'display_name' => 'Credit Executive', 'description' => 'Conducts financial risk analysis and recommendations'],
            ['name' => 'credit_manager', 'display_name' => 'Credit Manager', 'description' => 'Final credit approval authority'],
            ['name' => 'finance_executive', 'display_name' => 'Finance Executive', 'description' => 'Verifies fee payments and accounts'],
            ['name' => 'operations_executive', 'display_name' => 'Operations Executive', 'description' => 'Executes pre-disbursement checks and disbursements'],
            ['name' => 'manager', 'display_name' => 'General Manager', 'description' => 'Operational KPI and report access'],
            ['name' => 'customer', 'display_name' => 'Customer', 'description' => 'End-user loan applicant'],
        ];

        foreach ($roles as $r) {
            Role::firstOrCreate(['name' => $r['name']], $r);
        }

        // 2. Seed Users
        // Admin
        User::firstOrCreate(
            ['email' => 'admin@rcrfinance.com'],
            [
                'name' => 'RCR Super Admin',
                'phone' => '9000000001',
                'password' => Hash::make('Admin@1234'),
                'role' => UserRole::SUPER_ADMIN,
                'status' => 'active',
                'email_verified_at' => now(),
                'phone_verified_at' => now(),
            ]
        );

        // Verification & Credit Staff
        User::firstOrCreate(
            ['email' => 'officer@rcrfinance.com'],
            [
                'name' => 'Rajesh Sharma (Credit Manager)',
                'phone' => '9000000002',
                'password' => Hash::make('Officer@1234'),
                'role' => UserRole::CREDIT_MANAGER,
                'status' => 'active',
                'email_verified_at' => now(),
                'phone_verified_at' => now(),
            ]
        );

        // Demo Customer
        User::firstOrCreate(
            ['email' => 'customer@rcrfinance.com'],
            [
                'name' => 'Aarav Patel',
                'phone' => '9876543210',
                'password' => Hash::make('Customer@1234'),
                'role' => UserRole::CUSTOMER,
                'status' => 'active',
                'email_verified_at' => now(),
                'phone_verified_at' => now(),
            ]
        );

        // 3. Seed Loan Categories
        $categories = [
            [
                'name' => 'Personal Loans',
                'slug' => 'personal-loans',
                'icon' => 'User',
                'description' => 'Quick, collateral-free instant loans for personal emergencies, medical, or travel.',
                'display_order' => 1,
            ],
            [
                'name' => 'Business Loans',
                'slug' => 'business-loans',
                'icon' => 'Building2',
                'description' => 'Fuel business expansion, working capital, and equipment financing for MSMEs.',
                'display_order' => 2,
            ],
            [
                'name' => 'Vehicle Loans',
                'slug' => 'vehicle-loans',
                'icon' => 'Car',
                'description' => 'Affordable financing for new or pre-owned two-wheelers and commercial cars.',
                'display_order' => 3,
            ],
            [
                'name' => 'Home Renovation Loans',
                'slug' => 'home-renovation',
                'icon' => 'Home',
                'description' => 'Upgrade your living space with minimal paperwork and flexible repayments.',
                'display_order' => 4,
            ],
        ];

        foreach ($categories as $catData) {
            $category = LoanCategory::firstOrCreate(['slug' => $catData['slug']], $catData);

            // Seed Products for each category
            if ($catData['slug'] === 'personal-loans') {
                $p1 = LoanProduct::firstOrCreate(
                    ['slug' => 'personal-express-loan'],
                    [
                        'category_id' => $category->id,
                        'name' => 'Personal Express Loan',
                        'code' => 'PL-EXP-01',
                        'description' => 'Fast digital disbursement within 24 hours. Minimal documentation required.',
                        'min_amount' => 15000,
                        'max_amount' => 500000,
                        'min_tenure_months' => 6,
                        'max_tenure_months' => 36,
                        'default_tenure_months' => 24,
                        'min_interest_rate' => 11.50,
                        'max_interest_rate' => 18.00,
                        'default_interest_rate' => 13.50,
                        'processing_fee_pct' => 1.50,
                        'min_processing_fee' => 500,
                        'icon' => 'Zap',
                    ]
                );

                ProductEligibilityRule::firstOrCreate(
                    ['product_id' => $p1->id],
                    [
                        'min_age' => 21,
                        'max_age' => 58,
                        'min_monthly_income' => 25000,
                        'min_credit_score' => 650,
                        'allowed_employment_types' => ['salaried', 'self_employed'],
                        'max_dti_ratio' => 50.00,
                    ]
                );

                $requirements = [
                    ['document_type' => 'pan_card', 'name' => 'PAN Card Copy', 'description' => 'Clear photo or scan of PAN card', 'is_mandatory' => true],
                    ['document_type' => 'aadhaar_card', 'name' => 'Aadhaar Card (Front & Back)', 'description' => 'Government issued Aadhaar identification', 'is_mandatory' => true],
                    ['document_type' => 'salary_slip', 'name' => 'Latest 3 Months Salary Slips', 'description' => 'Employer salary slips with company seal/stamp', 'is_mandatory' => true],
                    ['document_type' => 'bank_statement', 'name' => '6 Months Bank Statement', 'description' => 'Primary salary bank account statement in PDF format', 'is_mandatory' => true],
                ];

                foreach ($requirements as $req) {
                    ProductDocumentRequirement::firstOrCreate(
                        ['product_id' => $p1->id, 'document_type' => $req['document_type']],
                        array_merge($req, ['product_id' => $p1->id, 'max_size_mb' => 10, 'allowed_formats' => ['pdf', 'jpeg', 'jpg', 'png']])
                    );
                }
            }

            if ($catData['slug'] === 'business-loans') {
                $p2 = LoanProduct::firstOrCreate(
                    ['slug' => 'msme-growth-loan'],
                    [
                        'category_id' => $category->id,
                        'name' => 'MSME Business Growth Loan',
                        'code' => 'BL-MSME-01',
                        'description' => 'Working capital and asset purchase loan for small & medium business owners.',
                        'min_amount' => 100000,
                        'max_amount' => 2500000,
                        'min_tenure_months' => 12,
                        'max_tenure_months' => 60,
                        'default_tenure_months' => 36,
                        'min_interest_rate' => 13.00,
                        'max_interest_rate' => 22.00,
                        'default_interest_rate' => 15.00,
                        'processing_fee_pct' => 2.00,
                        'min_processing_fee' => 2000,
                        'icon' => 'TrendingUp',
                    ]
                );

                ProductEligibilityRule::firstOrCreate(
                    ['product_id' => $p2->id],
                    [
                        'min_age' => 24,
                        'max_age' => 65,
                        'min_monthly_income' => 50000,
                        'min_credit_score' => 680,
                        'allowed_employment_types' => ['self_employed', 'business'],
                        'max_dti_ratio' => 55.00,
                    ]
                );

                $requirements = [
                    ['document_type' => 'pan_card', 'name' => 'Business & Personal PAN Card', 'description' => 'PAN Card of owner/firm', 'is_mandatory' => true],
                    ['document_type' => 'business_proof', 'name' => 'GST Registration / Udyam Certificate', 'description' => 'Proof of business registration and vintage', 'is_mandatory' => true],
                    ['document_type' => 'itr', 'name' => 'Last 2 Years ITR with Computation', 'description' => 'Income Tax Returns filed for previous 2 financial years', 'is_mandatory' => true],
                    ['document_type' => 'bank_statement', 'name' => '12 Months Current Account Statement', 'description' => 'Bank statement of principal business account', 'is_mandatory' => true],
                ];

                foreach ($requirements as $req) {
                    ProductDocumentRequirement::firstOrCreate(
                        ['product_id' => $p2->id, 'document_type' => $req['document_type']],
                        array_merge($req, ['product_id' => $p2->id, 'max_size_mb' => 15, 'allowed_formats' => ['pdf', 'jpeg', 'jpg', 'png']])
                    );
                }
            }

            if ($catData['slug'] === 'vehicle-loans') {
                $p3 = LoanProduct::firstOrCreate(
                    ['slug' => 'two-wheeler-car-loan'],
                    [
                        'category_id' => $category->id,
                        'name' => 'Easy Auto & Vehicle Loan',
                        'code' => 'VL-AUTO-01',
                        'description' => 'Quick loan with up to 90% on-road price financing for two-wheelers and cars.',
                        'min_amount' => 30000,
                        'max_amount' => 1500000,
                        'min_tenure_months' => 12,
                        'max_tenure_months' => 60,
                        'default_tenure_months' => 36,
                        'min_interest_rate' => 9.50,
                        'max_interest_rate' => 15.00,
                        'default_interest_rate' => 11.00,
                        'processing_fee_pct' => 1.00,
                        'min_processing_fee' => 1000,
                        'icon' => 'Car',
                    ]
                );

                ProductEligibilityRule::firstOrCreate(
                    ['product_id' => $p3->id],
                    [
                        'min_age' => 21,
                        'max_age' => 60,
                        'min_monthly_income' => 20000,
                        'min_credit_score' => 650,
                        'allowed_employment_types' => ['salaried', 'self_employed', 'business'],
                        'max_dti_ratio' => 50.00,
                    ]
                );
            }
        }
    }
}
