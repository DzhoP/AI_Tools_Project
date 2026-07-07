<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\AiTool;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class AiToolController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = AiTool::with(['categories', 'roles', 'tags', 'examples', 'user:id,name,role_id', 'user.role:id,label'])
            ->withAvg('reviews', 'rating')
            ->withCount('reviews');

        // Публичният списък показва само одобрени; Owner може да филтрира по статус
        $viewer = $request->user('sanctum');
        if ($viewer?->hasRole('owner') && $request->filled('status')) {
            if ($request->status !== 'all') {
                $query->where('status', $request->status);
            }
        } else {
            $query->where('status', 'approved');
        }

        if ($request->filled('category')) {
            $query->whereHas('categories', fn($q) => $q->where('slug', $request->category));
        }

        if ($request->filled('role')) {
            $query->whereHas('roles', fn($q) => $q->where('name', $request->role));
        }

        if ($request->filled('tag')) {
            $query->whereHas('tags', fn($q) => $q->where('slug', $request->tag));
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(fn($q) => $q
                ->where('name', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%")
            );
        }

        if ($request->filled('difficulty')) {
            $query->where('difficulty', $request->difficulty);
        }

        return response()->json($query->latest()->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'              => ['required', 'string', 'max:255'],
            'description'       => ['nullable', 'string'],
            'how_to_use'        => ['nullable', 'string'],
            'url'               => ['nullable', 'url', 'max:500'],
            'logo_url'          => ['nullable', 'url', 'max:500'],
            'documentation_url' => ['nullable', 'url', 'max:500'],
            'video_url'         => ['nullable', 'url', 'max:500'],
            'difficulty'        => ['required', 'in:beginner,intermediate,advanced'],
            'is_active'         => ['boolean'],
            'is_free'           => ['boolean'],
            'category_ids'      => ['array'],
            'category_ids.*'    => ['integer', 'exists:categories,id'],
            'role_ids'          => ['array'],
            'role_ids.*'        => ['integer', 'exists:roles,id'],
            'tag_ids'           => ['array'],
            'tag_ids.*'         => ['integer', 'exists:tags,id'],
            'examples'          => ['array', 'max:10'],
            'examples.*.title'     => ['nullable', 'string', 'max:255'],
            'examples.*.url'       => ['nullable', 'url', 'max:500'],
            'examples.*.image_url' => ['nullable', 'url', 'max:500'],
            'examples.*.description' => ['nullable', 'string', 'max:1000'],
        ]);

        $data['slug'] = $this->uniqueSlug(Str::slug($data['name']));
        $data['user_id'] = $request->user()->id;
        $data['status'] = $request->user()->hasRole('owner') ? 'approved' : 'pending';

        $tool = AiTool::create($data);
        ActivityLog::record($request->user(), $tool, 'created');
        $tool->categories()->sync($data['category_ids'] ?? []);
        $tool->roles()->sync($data['role_ids'] ?? []);
        $tool->tags()->sync($data['tag_ids'] ?? []);
        $this->syncExamples($tool, $data['examples'] ?? []);
        Cache::tags(CategoryController::CACHE_TAG)->flush();

        return response()->json($tool->load(['categories', 'roles', 'tags', 'examples', 'user:id,name,role_id', 'user.role:id,label']), 201);
    }

    public function show(AiTool $aiTool): JsonResponse
    {
        $aiTool->loadAvg('reviews', 'rating')->loadCount('reviews');

        return response()->json($aiTool->load(['categories', 'roles', 'tags', 'examples', 'user:id,name,role_id', 'user.role:id,label']));
    }

    public function update(Request $request, AiTool $aiTool): JsonResponse
    {
        $this->authorizeOwnership($request, $aiTool);

        $data = $request->validate([
            'name'              => ['sometimes', 'string', 'max:255'],
            'description'       => ['nullable', 'string'],
            'how_to_use'        => ['nullable', 'string'],
            'url'               => ['nullable', 'url', 'max:500'],
            'logo_url'          => ['nullable', 'url', 'max:500'],
            'documentation_url' => ['nullable', 'url', 'max:500'],
            'video_url'         => ['nullable', 'url', 'max:500'],
            'difficulty'        => ['sometimes', 'in:beginner,intermediate,advanced'],
            'is_active'         => ['boolean'],
            'is_free'           => ['boolean'],
            'category_ids'      => ['array'],
            'category_ids.*'    => ['integer', 'exists:categories,id'],
            'role_ids'          => ['array'],
            'role_ids.*'        => ['integer', 'exists:roles,id'],
            'tag_ids'           => ['array'],
            'tag_ids.*'         => ['integer', 'exists:tags,id'],
            'examples'          => ['array', 'max:10'],
            'examples.*.title'     => ['nullable', 'string', 'max:255'],
            'examples.*.url'       => ['nullable', 'url', 'max:500'],
            'examples.*.image_url' => ['nullable', 'url', 'max:500'],
            'examples.*.description' => ['nullable', 'string', 'max:1000'],
        ]);

        if (isset($data['name'])) {
            $data['slug'] = $this->uniqueSlug(Str::slug($data['name']), $aiTool->id);
        }

        $aiTool->update($data);

        if (array_key_exists('category_ids', $data)) {
            $aiTool->categories()->sync($data['category_ids']);
        }
        if (array_key_exists('role_ids', $data)) {
            $aiTool->roles()->sync($data['role_ids']);
        }
        if (array_key_exists('tag_ids', $data)) {
            $aiTool->tags()->sync($data['tag_ids']);
        }
        if (array_key_exists('examples', $data)) {
            $this->syncExamples($aiTool, $data['examples']);
        }

        Cache::tags(CategoryController::CACHE_TAG)->flush();

        return response()->json($aiTool->load(['categories', 'roles', 'tags', 'examples', 'user:id,name,role_id', 'user.role:id,label']));
    }

    public function destroy(Request $request, AiTool $aiTool): JsonResponse
    {
        $this->authorizeOwnership($request, $aiTool);

        ActivityLog::record($request->user(), $aiTool, 'deleted');
        $aiTool->delete();
        Cache::tags(CategoryController::CACHE_TAG)->flush();

        return response()->json(['message' => 'Инструментът е изтрит.']);
    }

    public function setStatus(Request $request, AiTool $aiTool): JsonResponse
    {
        // Достъпът е ограничен от 'role:owner' middleware в routes/api.php
        $data = $request->validate([
            'status' => ['required', 'in:pending,approved,rejected'],
        ]);

        $aiTool->update($data);
        ActivityLog::record($request->user(), $aiTool, $data['status']);
        Cache::tags(CategoryController::CACHE_TAG)->flush();

        return response()->json($aiTool->load(['categories', 'roles', 'tags', 'examples', 'user:id,name,role_id', 'user.role:id,label']));
    }

    private function authorizeOwnership(Request $request, AiTool $aiTool): void
    {
        $user = $request->user();

        if ($aiTool->user_id !== $user->id && ! $user->hasRole('owner')) {
            abort(403, 'Само авторът или Owner може да променя този инструмент.');
        }
    }

    private function uniqueSlug(string $base, ?int $excludeId = null): string
    {
        $slug = $base;
        $i = 1;
        while (
            AiTool::where('slug', $slug)
                ->when($excludeId, fn($q) => $q->where('id', '!=', $excludeId))
                ->exists()
        ) {
            $slug = "{$base}-{$i}";
            $i++;
        }
        return $slug;
    }

    private function syncExamples(AiTool $tool, array $examples): void
    {
        $tool->examples()->delete();

        foreach ($examples as $i => $ex) {
            if (empty($ex['url']) && empty($ex['image_url']) && empty($ex['title'])) {
                continue;
            }
            $tool->examples()->create([
                'title'       => $ex['title'] ?? null,
                'url'         => $ex['url'] ?? null,
                'image_url'   => $ex['image_url'] ?? null,
                'description' => $ex['description'] ?? null,
                'sort_order'  => $i,
            ]);
        }
    }
}
