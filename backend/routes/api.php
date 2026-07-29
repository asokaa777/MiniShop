<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ReviewController;

Route::apiResource('products', ProductController::class);

// Reviews nested under products
Route::get('/products/{product}/reviews', [ReviewController::class, 'index']);
Route::post('/products/{product}/reviews', [ReviewController::class, 'store']);

Route::get('/orders', [OrderController::class, 'index']);
Route::get('/orders/{id}', [OrderController::class, 'show']);
Route::post('/orders', [OrderController::class, 'store']);
