<?php

namespace Database\Seeders;

use App\Models\Tag;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TagSeeder extends Seeder
{
    public function run(): void
    {
        $tags = [
            ['name' => 'GPT-4',         'color' => '#10b981'],
            ['name' => 'Claude',         'color' => '#6366f1'],
            ['name' => 'Gemini',         'color' => '#3b82f6'],
            ['name' => 'Open Source',    'color' => '#f59e0b'],
            ['name' => 'API',            'color' => '#8b5cf6'],
            ['name' => 'No-code',        'color' => '#ec4899'],
            ['name' => 'Автоматизация', 'color' => '#14b8a6'],
            ['name' => 'Код',            'color' => '#64748b'],
            ['name' => 'Чат',            'color' => '#ef4444'],
            ['name' => 'Безплатен',      'color' => '#22c55e'],
        ];

        foreach ($tags as $tag) {
            Tag::firstOrCreate(
                ['slug' => Str::slug($tag['name'])],
                $tag + ['slug' => Str::slug($tag['name'])]
            );
        }
    }
}
