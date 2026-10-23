<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('application_personal_details', function (Blueprint $table) {
            if (!Schema::hasColumn('application_personal_details', 'father_husband_name')) {
                $table->string('father_husband_name')->nullable()->after('last_name');
            }
            if (!Schema::hasColumn('application_personal_details', 'residence_type')) {
                $table->string('residence_type', 50)->nullable()->after('current_pincode'); // Own, Rented, Family, Other
            }
            if (!Schema::hasColumn('application_personal_details', 'years_at_current_address')) {
                $table->string('years_at_current_address', 20)->nullable()->after('residence_type');
            }
            if (!Schema::hasColumn('application_personal_details', 'reference_name')) {
                $table->string('reference_name', 150)->nullable()->after('aadhaar_number');
            }
            if (!Schema::hasColumn('application_personal_details', 'reference_phone')) {
                $table->string('reference_phone', 20)->nullable()->after('reference_name');
            }
            if (!Schema::hasColumn('application_personal_details', 'reference_relationship')) {
                $table->string('reference_relationship', 100)->nullable()->after('reference_phone');
            }
            if (!Schema::hasColumn('application_personal_details', 'declaration_accepted')) {
                $table->boolean('declaration_accepted')->default(false)->after('reference_relationship');
            }
        });
    }

    public function down(): void
    {
        Schema::table('application_personal_details', function (Blueprint $table) {
            $columnsToDrop = [];
            foreach ([
                'father_husband_name',
                'residence_type',
                'years_at_current_address',
                'reference_name',
                'reference_phone',
                'reference_relationship',
                'declaration_accepted'
            ] as $col) {
                if (Schema::hasColumn('application_personal_details', $col)) {
                    $columnsToDrop[] = $col;
                }
            }
            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }
};
