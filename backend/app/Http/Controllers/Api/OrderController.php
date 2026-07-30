<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    /** Admin: semua order */
    public function index()
    {
        return response()->json(
            Order::with(['items.product', 'items.variant', 'user:id,name,email'])
                ->latest()
                ->get()
        );
    }

    /** Customer: hanya order milik sendiri */
    public function myOrders(Request $request)
    {
        return response()->json(
            $request->user()
                ->orders()
                ->with(['items.product', 'items.variant'])
                ->latest()
                ->get()
        );
    }

    public function show(Request $request, int $id)
    {
        $order = Order::with(['items.product', 'items.variant'])->findOrFail($id);

        if (!$request->user()->isAdmin() && $order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return response()->json($order);
    }

    public function store(Request $request)
    {
        $request->validate([
            'items'              => 'required|array|min:1',
            'items.*.id'         => 'required|exists:products,id',
            'items.*.variant_id' => 'nullable|exists:product_variants,id',
            'items.*.qty'        => 'required|integer|min:1',
        ]);

        $order = DB::transaction(function () use ($request) {
            $total = 0;
            $itemsData = [];

            foreach ($request->items as $item) {
                $product = Product::lockForUpdate()->findOrFail($item['id']);
                $variant = null;

                if (!empty($item['variant_id'])) {
                    $variant = ProductVariant::lockForUpdate()->where('product_id', $product->id)->findOrFail($item['variant_id']);

                    if ($variant->stock < $item['qty']) {
                        throw ValidationException::withMessages([
                            'stock' => "Stok varian \"{$variant->name}\" dari \"{$product->name}\" tidak cukup. Tersisa {$variant->stock}.",
                        ]);
                    }

                    $itemPrice = $variant->price ?? $product->price;
                } else {
                    if ($product->stock < $item['qty']) {
                        throw ValidationException::withMessages([
                            'stock' => "Stok \"{$product->name}\" tidak cukup. Tersisa {$product->stock}.",
                        ]);
                    }

                    $itemPrice = $product->price;
                }

                $subtotal = $itemPrice * $item['qty'];
                $total += $subtotal;

                $itemsData[] = [
                    'product'      => $product,
                    'variant'      => $variant,
                    'qty'          => $item['qty'],
                    'price'        => $itemPrice,
                    'subtotal'     => $subtotal,
                ];
            }

            $order = Order::create([
                'user_id'      => $request->user()->id,
                'order_number' => 'ORD-' . strtoupper(substr(uniqid(), -6)),
                'total_price'  => $total,
                'status'       => 'pending',
            ]);

            foreach ($itemsData as $data) {
                OrderItem::create([
                    'order_id'     => $order->id,
                    'product_id'   => $data['product']->id,
                    'variant_id'   => $data['variant']?->id,
                    'variant_name' => $data['variant']?->name,
                    'quantity'     => $data['qty'],
                    'price'        => $data['price'],
                    'subtotal'     => $data['subtotal'],
                ]);

                if ($data['variant']) {
                    $data['variant']->decrement('stock', $data['qty']);
                } else {
                    $data['product']->decrement('stock', $data['qty']);
                }
            }

            return $order->load('items.product', 'items.variant');
        });

        return response()->json(['message' => 'Order berhasil', 'order' => $order], 201);
    }
}
