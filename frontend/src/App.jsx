import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "./services/api";

import Navbar from "./components/Navbar";
import Shop from "./pages/Shop";
import Cart from "./components/Cart";
import Admin from "./pages/Admin";
import OrderSuccess from "./pages/OrderSuccess";

// ─── localStorage helpers ───────────────────────────────────────────────────
const CART_KEY = "minishop_cart";

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}
// ────────────────────────────────────────────────────────────────────────────

function App() {
  const [products, setProducts] = useState([]);
  // Initialise cart from localStorage (bonus: persist across refresh)
  const [cart, setCartState] = useState(loadCart);

  // Wrapper keeps localStorage in sync on every cart change
  const setCart = (value) => {
    const next = typeof value === "function" ? value(cart) : value;
    setCartState(next);
    saveCart(next);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    api
      .get("/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err));
  };

  const addToCart = (product) => {
    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      if (existing.qty >= product.stock) {
        alert("Stok tidak mencukupi!");
        return;
      }
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      );
    } else {
      if (product.stock === 0) {
        alert("Produk ini sudah habis!");
        return;
      }
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <BrowserRouter>
      <Navbar cartCount={cartCount} />

      <Routes>
        <Route
          path="/"
          element={<Shop products={products} addToCart={addToCart} />}
        />
        <Route
          path="/cart"
          element={
            <Cart
              cart={cart}
              setCart={setCart}
              onCheckoutSuccess={fetchProducts}
            />
          }
        />
        <Route path="/admin" element={<Admin />} />
        <Route path="/order-success" element={<OrderSuccess />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
