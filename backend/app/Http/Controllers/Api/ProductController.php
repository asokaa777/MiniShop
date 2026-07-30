<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('variants')
            ->withCount('reviews')
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
            'name'             => 'required|string|max:255',
            'price'            => 'required|numeric|min:0',
            'description'      => 'required',
            'image'            => 'nullable|string',
            'category'         => 'required|string',
            'stock'            => 'required|integer|min:0',
            'variants'         => 'nullable|array',
            'variants.*.name'  => 'required_with:variants|string|max:255',
            'variants.*.sku'   => 'nullable|string|max:255',
            'variants.*.price' => 'nullable|numeric|min:0',
            'variants.*.stock' => 'required_with:variants|integer|min:0',
        ]);

        $product = DB::transaction(function () use ($validated, $request) {
            $product = Product::create([
                'name'        => $validated['name'],
                'price'       => $validated['price'],
                'description' => $validated['description'],
                'image'       => $validated['image'] ?? null,
                'category'    => $validated['category'],
                'stock'       => $validated['stock'],
            ]);

            if (!empty($request->variants)) {
                foreach ($request->variants as $variantData) {
                    $product->variants()->create([
                        'name'  => $variantData['name'],
                        'sku'   => $variantData['sku'] ?? null,
                        'price' => $variantData['price'] ?? null,
                        'stock' => $variantData['stock'],
                    ]);
                }
            }

            return $product->load('variants');
        });

        return response()->json([
            'message' => 'Product created successfully',
            'data'    => $product,
        ], 201);
    }

    public function show(string $id)
    {
        $product = Product::with('variants')
            ->withCount('reviews')
            ->withAvg('reviews', 'rating')
            ->findOrFail($id);

        return response()->json($product);
    }

    public function update(Request $request, string $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name'             => 'required|string|max:255',
            'price'            => 'required|numeric|min:0',
            'description'      => 'required',
            'image'            => 'nullable|string',
            'category'         => 'required|string',
            'stock'            => 'required|integer|min:0',
            'variants'         => 'nullable|array',
            'variants.*.name'  => 'required_with:variants|string|max:255',
            'variants.*.sku'   => 'nullable|string|max:255',
            'variants.*.price' => 'nullable|numeric|min:0',
            'variants.*.stock' => 'required_with:variants|integer|min:0',
        ]);

        $updatedProduct = DB::transaction(function () use ($product, $validated, $request) {
            $product->update([
                'name'        => $validated['name'],
                'price'       => $validated['price'],
                'description' => $validated['description'],
                'image'       => $validated['image'] ?? null,
                'category'    => $validated['category'],
                'stock'       => $validated['stock'],
            ]);

            // Sync variants if provided
            if ($request->has('variants')) {
                $product->variants()->delete();
                if (!empty($request->variants)) {
                    foreach ($request->variants as $variantData) {
                        $product->variants()->create([
                            'name'  => $variantData['name'],
                            'sku'   => $variantData['sku'] ?? null,
                            'price' => $variantData['price'] ?? null,
                            'stock' => $variantData['stock'],
                        ]);
                    }
                }
            }

            return $product->load('variants');
        });

        return response()->json([
            'message' => 'Product updated successfully',
            'data'    => $updatedProduct,
        ]);
    }

    public function destroy(string $id)
    {
        Product::findOrFail($id)->delete();

        return response()->json(['message' => 'Product deleted successfully']);
    }
}
