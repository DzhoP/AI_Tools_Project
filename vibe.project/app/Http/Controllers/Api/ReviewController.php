<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AiTool;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(AiTool $aiTool): JsonResponse
    {
        $reviews = $aiTool->reviews()
            ->with('user:id,name,role_id', 'user.role:id,label')
            ->latest()
            ->get();

        return response()->json($reviews);
    }

    public function store(Request $request, AiTool $aiTool): JsonResponse
    {
        $data = $request->validate([
            'rating'  => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:2000'],
        ]);

        // Един отзив на потребител — повторно изпращане обновява съществуващия
        $review = Review::updateOrCreate(
            ['user_id' => $request->user()->id, 'ai_tool_id' => $aiTool->id],
            ['rating' => $data['rating'], 'comment' => $data['comment'] ?? null],
        );

        return response()->json(
            $review->load('user:id,name,role_id', 'user.role:id,label'),
            201
        );
    }

    public function destroy(Request $request, Review $review): JsonResponse
    {
        $user = $request->user();

        if ($review->user_id !== $user->id && ! $user->hasRole('owner')) {
            abort(403, 'Само авторът на отзива или Owner може да го изтрие.');
        }

        $review->delete();

        return response()->json(['message' => 'Отзивът е изтрит.']);
    }
}
