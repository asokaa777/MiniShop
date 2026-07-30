<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ReviewController;

// ─── Public routes ────────────────────────────────────────────────────────────

Route::prefix('auth')->group(function () {
    Route::post('register',             [AuthController::class, 'register']);
    Route::post('login',                [AuthController::class, 'login']);
    Route::post('social/{provider}',    [AuthController::class, 'socialLogin']);
});

Route::apiResource('products', ProductController::class)->only(['index', 'show']);
Route::get('/products/{product}/reviews',  [ReviewController::class, 'index']);

// ─── Authenticated routes ─────────────────────────────────────────────────────

Route::middleware('auth:sanctum')->group(function () {
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::get('auth/me',      [AuthController::class, 'me']);

    Route::post('/products/{product}/reviews', [ReviewController::class, 'store']);

    // Customer: place & view own orders
    Route::post('/orders',         [OrderController::class, 'store']);
    Route::get('/orders/mine',     [OrderController::class, 'myOrders']);
    Route::get('/orders/{id}',     [OrderController::class, 'show']);

    // Admin only
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('products', ProductController::class)->except(['index', 'show']);
        Route::get('/orders', [OrderController::class, 'index']);
    });
});
