<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    // Ключово за инвалидация: всяка промяна в категории ИЛИ инструменти
    // (брой инструменти на категория)flush-ва целия таг наведнъж.
    public const CACHE_TAG = 'categories';

    public function index(): JsonResponse
    {
        $categories = Cache::tags(self::CACHE_TAG)->remember(
            'categories.index',
            now()->addHours(6),
            fn () => Category::withCount('aiTools')->orderBy('name')->get()->toArray()
        );

        return response()->json($categories);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'        => ['required', 'string', 'max:100', 'unique:categories'],
            'description' => ['nullable', 'string', 'max:500'],
            'color'       => ['nullable', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ]);

        $data['slug'] = Str::slug($data['name']);

        $category = Category::create($data);
        Cache::tags(self::CACHE_TAG)->flush();

        return response()->json($category, 201);
    }

    public function destroy(Category $category): JsonResponse
    {
        $category->delete();
        Cache::tags(self::CACHE_TAG)->flush();

        return response()->json(['message' => 'Категорията е изтрита.']);
    }
}
