import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "./services/api";

import { AuthProvider } from "./context/AuthContext";
import { RequireAuth, RequireAdmin, RequireGuest } from "./components/RouteGuards";
import Navbar from "./components/Navbar";
import Shop from "./pages/Shop";
import Cart from "./components/Cart";
import Admin from "./pages/Admin";
import OrderSuccess from "./pages/OrderSuccess";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import OrdersPage from "./pages/Orders";

// ─── localStorage cart helpers ────────────────────────────────────────────────
const CART_KEY = "minishop_cart";
const loadCart = () => { try { return JSON.parse(localStorage.getItem(CART_KEY)) ?? []; } catch { return []; } };
const saveCart = (cart) => localStorage.setItem(CART_KEY, JSON.stringify(cart));
// ─────────────────────────────────────────────────────────────────────────────

function AppShell() {
  const [products,  setProducts]  = useState([]);
  const [cartState, setCartState] = useState(loadCart);

  const setCart = (value) => {
    const next = typeof value === "function" ? value(cartState) : value;
    setCartState(next);
    saveCart(next);
  };

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = () => {
    api.get("/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err));
  };

  const addToCart = (product) => {
    const existing = cartState.find((item) => item.id === product.id);
    if (existing) {
      if (existing.qty >= product.stock) { alert("Stok tidak mencukupi!"); return; }
      setCart(cartState.map((item) => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      if (product.stock === 0) { alert("Produk ini sudah habis!"); return; }
      setCart([...cartState, { ...product, qty: 1 }]);
    }
  };

  const cartCount = cartState.reduce((sum, item) => sum + item.qty, 0);

  return (
    <>
      <Navbar cartCount={cartCount} />
      <Routes>
        {/* Public */}
        <Route path="/"              element={<Shop products={products} addToCart={addToCart} />} />
        <Route path="/login"         element={<RequireGuest><LoginPage /></RequireGuest>} />
        <Route path="/register"      element={<RequireGuest><RegisterPage /></RequireGuest>} />

        {/* Authenticated */}
        <Route path="/cart"          element={<RequireAuth><Cart cart={cartState} setCart={setCart} onCheckoutSuccess={fetchProducts} /></RequireAuth>} />
        <Route path="/order-success" element={<RequireAuth><OrderSuccess /></RequireAuth>} />
        <Route path="/orders"        element={<RequireAuth><OrdersPage /></RequireAuth>} />

        {/* Admin only */}
        <Route path="/admin"         element={<RequireAdmin><Admin /></RequireAdmin>} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
}
