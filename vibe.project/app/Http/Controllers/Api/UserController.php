<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // Достъпът е ограничен от 'role:owner' middleware в routes/api.php
        $users = User::with('role')
            ->withCount('aiTools')
            ->orderBy('name')
            ->get();

        return response()->json($users);
    }
}
