# MiniShop Mobile — React Native + Expo

Mobile app untuk MiniShop e-commerce platform. Terhubung langsung ke Laravel backend API di Railway.

---

## Features

✅ Product catalog dengan search & filter kategori  
✅ Product detail dengan qty selector  
✅ Shopping cart dengan update qty & remove item  
✅ Checkout ke backend Laravel (POST /api/orders)  
✅ Order success page dengan detail order  
✅ Pull to refresh di product list  
✅ Stock validation (client-side & server-side)  
✅ Responsive UI dengan React Native StyleSheet  
✅ TypeScript type safety  
✅ Expo Router (file-based routing)

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | React Native + Expo SDK 57 |
| Routing | Expo Router |
| State Management | React Context API (CartContext) |
| HTTP Client | Axios |
| Language | TypeScript |
| Backend API | Laravel 11 (Railway) |

---

## Project Structure

```
src/
├── app/                    # Expo Router screens (file-based routing)
│   ├── _layout.tsx        # Root layout with CartProvider
│   ├── index.tsx          # Home (product catalog)
│   ├── detail.tsx         # Product detail
│   ├── cart.tsx           # Shopping cart
│   └── success.tsx        # Order success
├── components/            # Reusable UI components
│   ├── ProductCard.tsx    # Product grid item
│   ├── CartItemRow.tsx    # Cart item with qty controls
│   ├── SearchBar.tsx      # Search input with clear button
│   ├── Loading.tsx        # Loading indicator
│   └── EmptyState.tsx     # Empty state placeholder
├── context/
│   └── CartContext.tsx    # Global cart state
├── services/
│   └── api.ts             # Axios instance (Railway URL)
├── types/
│   └── index.ts           # TypeScript interfaces
└── constants/
    └── colors.ts          # App color palette
```

---

## API Endpoints

Backend: `https://minishop-production-0016.up.railway.app/api`

| Method | Endpoint | Usage |
|---|---|---|
| GET | `/products` | Fetch all products |
| GET | `/products/{id}` | Fetch product detail |
| POST | `/orders` | Checkout (create order + decrement stock) |

---

## Installation & Running

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI (optional: `npm i -g expo-cli`)
- Expo Go app di Android/iOS device (untuk physical device testing)

### Setup

```bash
cd MiniShopApp

# Install dependencies
npm install

# Start Expo dev server
npx expo start
```

### Run on Device

**Android/iOS physical device:**
1. Install **Expo Go** dari Play Store/App Store
2. Scan QR code dari terminal
3. App akan load di Expo Go

**Android emulator:**
```bash
npx expo start --android
```

**iOS simulator (macOS only):**
```bash
npx expo start --ios
```

**Web (experimental):**
```bash
npx expo start --web
```

---

## Screens Overview

### 1. Home (`index.tsx`)
- Product grid (2 columns)
- Search bar
- Category filter chips
- Pull to refresh
- Cart badge di header
- Tap produk → Detail screen
- Tap ikon + → Add to cart langsung

### 2. Detail (`detail.tsx`)
- Hero image
- Category badge + stock indicator
- Price
- Description
- Qty selector dengan +/− buttons
- Stock validation (tidak bisa tambah qty melebihi stock - qty di cart)
- "Tambah ke Keranjang" button
- Alert confirmation dengan pilihan "Lanjut Belanja" atau "Ke Keranjang"

### 3. Cart (`cart.tsx`)
- List semua cart items
- Qty controls per item (+/− buttons)
- Remove item (dengan confirmation alert)
- Ringkasan belanja di bawah list
- Total harga
- Checkout button
- Confirmation alert sebelum POST ke backend
- Auto-redirect ke success screen setelah checkout berhasil

### 4. Success (`success.tsx`)
- ✅ Checkmark animation-style icon
- Order number badge
- Tanggal order
- List items dengan qty & subtotal
- Total pembayaran
- Status badge
- "Lanjut Belanja" button → kembali ke home

---

## Cart Context API

```tsx
import { useCart } from '../context/CartContext';

const { cart, cartCount, cartTotal, addToCart, removeFromCart, updateQty, clearCart } = useCart();

// Add product (default qty = 1)
addToCart(product, qty);

// Update qty of item in cart
updateQty(productId, newQty);

// Remove item from cart
removeFromCart(productId);

// Clear entire cart
clearCart();
```

---

## Known Limitations

- **No authentication:** App tidak pakai login (belum ada user/token management)
- **Cart tidak persist:** Kalau app di-close, cart hilang (tidak ada AsyncStorage/localStorage)
- **No pagination:** Semua produk di-load sekaligus (tidak ada lazy load/infinite scroll)
- **No image caching:** Gambar produk di-fetch ulang tiap kali render (bisa tambah `expo-image` untuk caching)
- **No push notifications:** Tidak ada notif real-time saat order diproses

---

## Future Improvements

- [ ] AsyncStorage untuk persist cart
- [ ] Authentication dengan Laravel Sanctum
- [ ] Order history screen (GET /api/orders)
- [ ] Image caching dengan `expo-image`
- [ ] Pagination untuk product list
- [ ] Product favoriting/wishlist
- [ ] Filter by price range
- [ ] Dark mode support
- [ ] Skeleton loading states
- [ ] Offline mode dengan react-query

---

## Troubleshooting

**Error: "Network request failed"**
- Pastikan device/emulator terhubung ke internet
- Cek Railway backend masih running: https://minishop-production-0016.up.railway.app/api/products

**TypeScript errors:**
```bash
npx tsc --noEmit
```

**Clear cache:**
```bash
npx expo start -c
```

**Reinstall dependencies:**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## License

MIT
