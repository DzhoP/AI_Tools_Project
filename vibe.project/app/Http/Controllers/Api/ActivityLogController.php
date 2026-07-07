<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;

class ActivityLogController extends Controller
{
    public function index(): JsonResponse
    {
        // Достъпът е ограничен от 'role:owner' middleware в routes/api.php
        $logs = ActivityLog::with('user:id,name')
            ->latest()
            ->limit(200)
            ->get();

        return response()->json($logs);
    }
}
