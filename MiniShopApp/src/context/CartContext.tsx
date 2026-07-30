import React, { createContext, useContext, useState, useCallback } from 'react';
import { CartItem, Product, ProductVariant } from '../types';

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (product: Product, variant?: ProductVariant, qty?: number) => void;
  removeFromCart: (productId: number, variantId?: number) => void;
  updateQty: (productId: number, variantId: number | undefined, qty: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = cart.reduce((sum, item) => {
    const itemPrice = item.variant?.price ?? item.product.price;
    return sum + itemPrice * item.qty;
  }, 0);

  const addToCart = useCallback((product: Product, variant?: ProductVariant, qty: number = 1) => {
    setCart((prev) => {
      const maxStock = variant ? variant.stock : product.stock;
      if (maxStock === 0) return prev;

      const existingIndex = prev.findIndex(
        (i) => i.product.id === product.id && i.variant?.id === variant?.id
      );

      if (existingIndex > -1) {
        const newQty = Math.min(prev[existingIndex].qty + qty, maxStock);
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], qty: newQty };
        return updated;
      }

      return [...prev, { product, variant, qty: Math.min(qty, maxStock) }];
    });
  }, []);

  const removeFromCart = useCallback((productId: number, variantId?: number) => {
    setCart((prev) =>
      prev.filter((i) => !(i.product.id === productId && i.variant?.id === variantId))
    );
  }, []);

  const updateQty = useCallback((productId: number, variantId: number | undefined, qty: number) => {
    if (qty < 1) return;
    setCart((prev) =>
      prev.map((i) => {
        if (i.product.id !== productId || i.variant?.id !== variantId) return i;
        const maxStock = i.variant ? i.variant.stock : i.product.stock;
        return { ...i, qty: Math.min(qty, maxStock) };
      })
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  return (
    <CartContext.Provider
      value={{ cart, cartCount, cartTotal, addToCart, removeFromCart, updateQty, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
