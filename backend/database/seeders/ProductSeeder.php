<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        Product::insert([
            [
                'name' => 'Laptop ASUS Vivobook',
                'price' => 8500000,
                'description' => 'Laptop untuk kerja dan kuliah.',
                'image' => 'https://picsum.photos/300?random=1',
                'category' => 'Laptop',
                'stock' => 10,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Mouse Logitech',
                'price' => 250000,
                'description' => 'Mouse wireless Logitech.',
                'image' => 'https://picsum.photos/300?random=2',
                'category' => 'Accessories',
                'stock' => 20,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Keyboard Mechanical',
                'price' => 700000,
                'description' => 'Mechanical RGB Keyboard.',
                'image' => 'https://picsum.photos/300?random=3',
                'category' => 'Accessories',
                'stock' => 15,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Monitor LG 24"',
                'price' => 2200000,
                'description' => 'Monitor IPS Full HD.',
                'image' => 'https://picsum.photos/300?random=4',
                'category' => 'Monitor',
                'stock' => 8,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'SSD 1TB',
                'price' => 1200000,
                'description' => 'SSD NVMe 1TB.',
                'image' => 'https://picsum.photos/300?random=5',
                'category' => 'Storage',
                'stock' => 12,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'RAM 16GB DDR4',
                'price' => 900000,
                'description' => 'RAM DDR4 16GB.',
                'image' => 'https://picsum.photos/300?random=6',
                'category' => 'Memory',
                'stock' => 18,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Flashdisk 64GB',
                'price' => 120000,
                'description' => 'USB Flashdisk 64GB.',
                'image' => 'https://picsum.photos/300?random=7',
                'category' => 'Storage',
                'stock' => 40,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Headset Gaming',
                'price' => 600000,
                'description' => 'Gaming headset surround.',
                'image' => 'https://picsum.photos/300?random=8',
                'category' => 'Audio',
                'stock' => 25,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Printer Epson',
                'price' => 2500000,
                'description' => 'Printer Ink Tank.',
                'image' => 'https://picsum.photos/300?random=9',
                'category' => 'Printer',
                'stock' => 5,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Webcam HD',
                'price' => 350000,
                'description' => 'Webcam Full HD.',
                'image' => 'https://picsum.photos/300?random=10',
                'category' => 'Accessories',
                'stock' => 14,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}