<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add full_name column to application_personal_details if it doesn't exist
        if (!Schema::hasColumn('application_personal_details', 'full_name')) {
            Schema::table('application_personal_details', function (Blueprint $table) {
                $table->string('full_name')->nullable()->after('application_id');
            });
        }

        // Alter columns in application_personal_details to be nullable
        try {
            DB::statement("ALTER TABLE application_personal_details MODIFY first_name VARCHAR(255) NULL DEFAULT ''");
            DB::statement("ALTER TABLE application_personal_details MODIFY last_name VARCHAR(255) NULL DEFAULT ''");
            DB::statement("ALTER TABLE application_personal_details MODIFY email VARCHAR(255) NULL DEFAULT ''");
            DB::statement("ALTER TABLE application_personal_details MODIFY phone VARCHAR(50) NULL DEFAULT ''");
        } catch (\Throwable $e) {
            // Log or continue if DB engine doesn't support raw ALTER
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('application_personal_details', 'full_name')) {
            Schema::table('application_personal_details', function (Blueprint $table) {
                $table->dropColumn('full_name');
            });
        }
    }
};
