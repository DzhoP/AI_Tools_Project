<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ai_tools', function (Blueprint $table) {
            $table->text('how_to_use')->nullable()->after('description');
        });
    }

    public function down(): void
    {
        Schema::table('ai_tools', function (Blueprint $table) {
            $table->dropColumn('how_to_use');
        });
    }
};
