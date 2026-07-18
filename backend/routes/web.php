<?php

use Illuminate\Support\Facades\Route;

// Health check & API info for root route
// The actual frontend is a separate React SPA (deployed on Vercel)
Route::get('/', function () {
    return response()->json([
        'app'     => 'MiniShop API',
        'version' => '1.0.0',
        'status'  => 'running',
        'docs'    => [
            'GET  /api/products'        => 'List all products',
            'GET  /api/products/{id}'   => 'Get product detail',
            'POST /api/products'        => 'Create product',
            'PUT  /api/products/{id}'   => 'Update product',
            'DELETE /api/products/{id}' => 'Delete product',
            'GET  /api/orders'          => 'List all orders',
            'GET  /api/orders/{id}'     => 'Get order detail',
            'POST /api/orders'          => 'Create order (checkout)',
        ],
    ]);
});
