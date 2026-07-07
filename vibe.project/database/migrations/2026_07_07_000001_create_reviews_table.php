<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('ai_tool_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('rating');   // 1–5 звезди
            $table->text('comment')->nullable();     // текстът е по желание
            $table->timestamps();

            // Един отзив на потребител за инструмент — повторното изпращане го обновява
            $table->unique(['user_id', 'ai_tool_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
