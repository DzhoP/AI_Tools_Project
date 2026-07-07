<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AiToolController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\TagController;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// throttle:5,1 = максимум 5 опита в минута от един IP — спира brute-force на паролата и 2FA кода
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
Route::post('/login/verify-2fa', [AuthController::class, 'verifyTwoFactor'])->middleware('throttle:5,1');
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:5,1');

// Public read-only endpoints
Route::get('/tools', [AiToolController::class, 'index']);
Route::get('/tools/{aiTool}', [AiToolController::class, 'show']);
Route::get('/tools/{aiTool}/reviews', [\App\Http\Controllers\Api\ReviewController::class, 'index']);
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

    // Отзиви — всеки логнат оставя/обновява своя, трие авторът или Owner
    Route::post('/tools/{aiTool}/reviews', [\App\Http\Controllers\Api\ReviewController::class, 'store']);
    Route::delete('/reviews/{review}', [\App\Http\Controllers\Api\ReviewController::class, 'destroy']);

    // AI Tools — protected write operations (author-or-owner проверка си остава вътре в контролера)
    Route::post('/tools', [AiToolController::class, 'store']);
    Route::put('/tools/{aiTool}', [AiToolController::class, 'update']);
    Route::delete('/tools/{aiTool}', [AiToolController::class, 'destroy']);

    // Само за Owner — заменя ръчните abort_unless() проверки в контролерите
    Route::middleware('role:owner')->group(function () {
        Route::get('/users', [\App\Http\Controllers\Api\UserController::class, 'index']);
        Route::patch('/tools/{aiTool}/status', [AiToolController::class, 'setStatus']);
        Route::get('/activity', [\App\Http\Controllers\Api\ActivityLogController::class, 'index']);

        // Изтриването е разрушително за всички (pivot записите падат каскадно) — само Owner
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);
        Route::delete('/tags/{tag}', [TagController::class, 'destroy']);
    });

    // Създаване на категории/тагове е позволено на всеки логнат — ToolForm ги създава inline
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::post('/tags', [TagController::class, 'store']);
});
