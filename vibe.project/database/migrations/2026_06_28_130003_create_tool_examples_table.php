<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tool_examples', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ai_tool_id')->constrained()->cascadeOnDelete();
            $table->string('title')->nullable();
            $table->string('url')->nullable();       // линк към примера
            $table->string('image_url')->nullable(); // скрийншот (URL)
            $table->text('description')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tool_examples');
    }
};
