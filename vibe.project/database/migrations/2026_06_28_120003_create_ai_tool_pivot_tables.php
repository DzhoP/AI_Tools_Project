<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ai_tool <-> category  (many-to-many)
        Schema::create('ai_tool_category', function (Blueprint $table) {
            $table->foreignId('ai_tool_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->primary(['ai_tool_id', 'category_id']);
        });

        // ai_tool <-> role  (many-to-many)
        Schema::create('ai_tool_role', function (Blueprint $table) {
            $table->foreignId('ai_tool_id')->constrained()->cascadeOnDelete();
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->primary(['ai_tool_id', 'role_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_tool_role');
        Schema::dropIfExists('ai_tool_category');
    }
};
