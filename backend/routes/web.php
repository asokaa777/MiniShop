<?php

use Illuminate\Support\Facades\Route;

// Health check & API info for root route
// The actual frontend is a separate React SPA (deployed on Vercel)
Route::get('/', function () {
    return response()->json([
        'app'     => 'MiniShop API',
        'version' => '1.1.0',
        'status'  => 'running',
        'docs'    => [
            'POST /api/auth/register'            => 'Register akun baru',
            'POST /api/auth/login'               => 'Login email+password',
            'POST /api/auth/social/{provider}'   => 'Login Google/Facebook',
            'GET  /api/auth/me'                  => 'Data user saat ini (auth)',
            'POST /api/auth/logout'              => 'Logout (auth)',
            'GET  /api/products'                 => 'List semua produk',
            'GET  /api/products/{id}'            => 'Detail produk',
            'POST /api/products'                 => 'Tambah produk (admin)',
            'PUT  /api/products/{id}'            => 'Update produk (admin)',
            'DELETE /api/products/{id}'          => 'Hapus produk (admin)',
            'GET  /api/products/{id}/reviews'    => 'List ulasan produk',
            'POST /api/products/{id}/reviews'    => 'Kirim ulasan (auth)',
            'GET  /api/orders'                   => 'List semua order (admin)',
            'GET  /api/orders/mine'              => 'Order saya (auth)',
            'GET  /api/orders/{id}'              => 'Detail order (auth)',
            'POST /api/orders'                   => 'Buat order/checkout (auth)',
        ],
    ]);
});
