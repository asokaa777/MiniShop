<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::withCount('reviews')
            ->withAvg('reviews', 'rating');

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        return response()->json(
            $query->latest()->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'price'       => 'required|numeric|min:0',
            'description' => 'required',
            'image'       => 'nullable|string',
            'category'    => 'required|string',
            'stock'       => 'required|integer|min:0',
        ]);

        $product = Product::create($validated);

        return response()->json([
            'message' => 'Product created successfully',
            'data'    => $product,
        ], 201);
    }

    public function show(string $id)
    {
        $product = Product::withCount('reviews')
            ->withAvg('reviews', 'rating')
            ->findOrFail($id);

        return response()->json($product);
    }

    public function update(Request $request, string $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'price'       => 'required|numeric|min:0',
            'description' => 'required',
            'image'       => 'nullable|string',
            'category'    => 'required|string',
            'stock'       => 'required|integer|min:0',
        ]);

        $product->update($validated);

        return response()->json([
            'message' => 'Product updated successfully',
            'data'    => $product,
        ]);
    }

    public function destroy(string $id)
    {
        Product::findOrFail($id)->delete();

        return response()->json(['message' => 'Product deleted successfully']);
    }
}
