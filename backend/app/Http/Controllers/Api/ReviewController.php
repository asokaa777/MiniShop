<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /** GET /api/products/{product}/reviews */
    public function index(Product $product)
    {
        $reviews = $product->reviews()
            ->latest()
            ->get(['id', 'reviewer_name', 'rating', 'comment', 'created_at']);

        return response()->json($reviews);
    }

    /** POST /api/products/{product}/reviews */
    public function store(Request $request, Product $product)
    {
        $validated = $request->validate([
            'reviewer_name' => 'required|string|max:100',
            'rating'        => 'required|integer|min:1|max:5',
            'comment'       => 'nullable|string|max:1000',
        ]);

        $review = $product->reviews()->create($validated);

        return response()->json([
            'message' => 'Review berhasil ditambahkan',
            'review'  => $review,
        ], 201);
    }
}
