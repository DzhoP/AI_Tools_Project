<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Код и разработка',    'color' => '#6366f1', 'description' => 'Инструменти за писане, ревю и дебъгване на код'],
            ['name' => 'Текст и съдържание',  'color' => '#10b981', 'description' => 'Генериране и редактиране на текстово съдържание'],
            ['name' => 'Изображения',          'color' => '#f59e0b', 'description' => 'Генериране и обработка на изображения'],
            ['name' => 'Данни и анализ',       'color' => '#3b82f6', 'description' => 'Анализ на данни, SQL и статистика'],
            ['name' => 'Продуктивност',        'color' => '#8b5cf6', 'description' => 'Автоматизация и управление на задачи'],
            ['name' => 'Тестване и QA',        'color' => '#ef4444', 'description' => 'Генериране на тестове и намиране на бъгове'],
            ['name' => 'Дизайн и UI/UX',       'color' => '#ec4899', 'description' => 'Дизайн инструменти и прототипиране'],
            ['name' => 'DevOps и Инфраструктура', 'color' => '#14b8a6', 'description' => 'CI/CD, мониторинг и облачни инструменти'],
        ];

        foreach ($categories as $cat) {
            Category::firstOrCreate(
                ['slug' => Str::slug($cat['name'])],
                $cat + ['slug' => Str::slug($cat['name'])]
            );
        }
    }
}
