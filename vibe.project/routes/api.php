<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AiToolController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\TagController;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/login/verify-2fa', [AuthController::class, 'verifyTwoFactor']);
Route::post('/register', [AuthController::class, 'register']);

// Public read-only endpoints
Route::get('/tools', [AiToolController::class, 'index']);
Route::get('/tools/{aiTool}', [AiToolController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/tags', [TagController::class, 'index']);
Route::get('/roles', fn() => Role::orderBy('label')->get());

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user()->load('role');
    });
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/user', [AuthController::class, 'updateProfile']);

    // Image upload (лого и скрийншоти)
    Route::post('/upload', [\App\Http\Controllers\Api\UploadController::class, 'store']);

    // AI Tools — protected write operations (author-or-owner проверка си остава вътре в контролера)
    Route::post('/tools', [AiToolController::class, 'store']);
    Route::put('/tools/{aiTool}', [AiToolController::class, 'update']);
    Route::delete('/tools/{aiTool}', [AiToolController::class, 'destroy']);

    // Само за Owner — заменя ръчните abort_unless() проверки в контролерите
    Route::middleware('role:owner')->group(function () {
        Route::get('/users', [\App\Http\Controllers\Api\UserController::class, 'index']);
        Route::patch('/tools/{aiTool}/status', [AiToolController::class, 'setStatus']);
        Route::get('/activity', [\App\Http\Controllers\Api\ActivityLogController::class, 'index']);
    });

    // Categories — protected write operations
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

    // Tags — protected write operations
    Route::post('/tags', [TagController::class, 'store']);
    Route::delete('/tags/{tag}', [TagController::class, 'destroy']);
});
