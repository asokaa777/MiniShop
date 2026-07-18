<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::with('items.product')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($orders);
    }

    public function show($id)
    {
        $order = Order::with('items.product')->findOrFail($id);

        return response()->json($order);
    }

    public function store(Request $request)
    {
        $request->validate([
            'items'          => 'required|array|min:1',
            'items.*.id'     => 'required|exists:products,id',
            'items.*.qty'    => 'required|integer|min:1',
        ]);

        $order = DB::transaction(function () use ($request) {
            $total = 0;

            // First pass: validate stock for all items
            foreach ($request->items as $item) {
                $product = Product::lockForUpdate()->findOrFail($item['id']);

                if ($product->stock < $item['qty']) {
                    throw ValidationException::withMessages([
                        'stock' => "Stock produk \"{$product->name}\" tidak cukup. Tersisa {$product->stock}.",
                    ]);
                }

                $total += $product->price * $item['qty'];
            }

            // Create order record
            $order = Order::create([
                'order_number' => 'ORD-' . strtoupper(substr(uniqid(), -6)),
                'total_price'  => $total,
                'status'       => 'pending',
            ]);

            // Second pass: create items and decrement stock
            foreach ($request->items as $item) {
                $product = Product::findOrFail($item['id']);

                OrderItem::create([
                    'order_id'   => $order->id,
                    'product_id' => $product->id,
                    'quantity'   => $item['qty'],
                    'price'      => $product->price,
                    'subtotal'   => $product->price * $item['qty'],
                ]);

                $product->decrement('stock', $item['qty']);
            }

            return $order->load('items.product');
        });

        return response()->json([
            'message' => 'Order berhasil',
            'order'   => $order,
        ], 201);
    }
}
