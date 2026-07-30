export interface ProductVariant {
  id: number;
  product_id: number;
  name: string;
  sku?: string;
  price?: number;
  stock: number;
  image?: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  stock: number;
  variants?: ProductVariant[];
  reviews_count?: number;
  reviews_avg_rating?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  product: Product;
  variant?: ProductVariant;
  qty: number;
}

export interface Review {
  id: number;
  product_id: number;
  reviewer_name: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface OrderItem {
  id: number;
  product_id: number;
  variant_id?: number;
  variant_name?: string;
  quantity: number;
  price: number;
  subtotal: number;
  product?: Product;
  variant?: ProductVariant;
}

export interface Order {
  id: number;
  order_number: string;
  total_price: number;
  status: string;
  created_at: string;
  items: OrderItem[];
}
