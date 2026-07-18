# MiniShop — Product Catalog & Cart

Full Stack Developer technical test project.

Full Stack Developer technical test project. A simple e-commerce app with product catalog, shopping cart, checkout, and admin panel.

---

## 1. Overview

MiniShop is a minimal e-commerce application that allows users to:
- Browse a product catalog with search and category filter
- View product details in a modal
- Add products to a shopping cart (persisted in localStorage)
- Checkout to create an order, with automatic stock deduction
- View an order success summary page

Admins can:
- Create, update, and delete products
- View all orders and order details

---

## 2. Tech Stack

| Layer | Tech | Reason |
|---|---|---|
| Frontend | React 19 + Vite | Fast dev experience, component-based UI, wide ecosystem |
| Routing | React Router v6 | De-facto standard for React SPA routing |
| Styling | Bootstrap 5 | Rapid responsive UI without custom CSS overhead |
| Backend | Laravel 11 | Robust PHP framework with Eloquent ORM, validation, and DB transactions |
| Database | MySQL (via XAMPP) | Relational DB fits order/product/order_items schema well |
| HTTP Client | Axios | Clean promise-based API calls with interceptors |

---

## 3. Running Locally

### Prerequisites
- PHP >= 8.2
- Composer
- Node.js >= 18
- XAMPP (MySQL running)

### Backend

```bash
cd backend

# Install dependencies
composer install

# Copy environment file and configure
cp .env.example .env

# Set DB credentials in .env
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=minishop
# DB_USERNAME=root
# DB_PASSWORD=

# Generate app key
php artisan key:generate

# Run migrations and seed 10 sample products
php artisan migrate:fresh --seed

# Start dev server
php artisan serve
```

Backend runs at: `http://127.0.0.1:8000`

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 4. API Endpoints

| Method | Endpoint | Description | Example Request Body |
|---|---|---|---|
| GET | `/api/products` | List all products (supports `?search=` & `?category=`) | — |
| GET | `/api/products/{id}` | Get single product | — |
| POST | `/api/products` | Create product | `{ name, price, description, image, category, stock }` |
| PUT | `/api/products/{id}` | Update product | `{ name, price, ... }` |
| DELETE | `/api/products/{id}` | Delete product | — |
| GET | `/api/orders` | List all orders (with items) | — |
| GET | `/api/orders/{id}` | Get single order detail | — |
| POST | `/api/orders` | Create order + decrement stock | `{ items: [{ id, qty }] }` |

### Example POST `/api/orders`

**Request:**
```json
{
  "items": [
    { "id": 1, "qty": 2 },
    { "id": 3, "qty": 1 }
  ]
}
```

**Response (201):**
```json
{
  "message": "Order berhasil",
  "order": {
    "id": 1,
    "order_number": "ORD-A1B2C3",
    "total_price": "17700000.00",
    "status": "pending",
    "created_at": "2026-07-18T10:00:00.000000Z",
    "items": [...]
  }
}
```

**Response (422 — stock tidak cukup):**
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "stock": ["Stock produk \"Laptop ASUS Vivobook\" tidak cukup. Tersisa 1."]
  }
}
```

---

## 5. Known Limitations

- **Authentication:** No login system. Admin panel is accessible to anyone at `/admin`. A real app would require JWT or Sanctum-protected routes.
- **Payment:** Checkout does not integrate a payment gateway (intentional per spec).
- **Order status:** Orders are created with status `pending` and cannot be updated from the UI.
- **Image upload:** Product images are URLs only — no file upload support.
- **Pagination:** Product listing loads all records without pagination, which won't scale for large catalogs.
- **Cart sync:** Cart is client-side (localStorage). If stock changes on the server after items are added, the cart won't reflect the update until the next page load.

---

## 6. Seed Data

Running `php artisan migrate:fresh --seed` inserts 10 products across categories: Laptop, Accessories, Monitor, Storage, Memory, Audio, Printer.


## 7. Features

- Product Catalog
- Search Products
- Category Filter
- Product Detail Modal
- Shopping Cart
- Checkout with Automatic Stock Update
- Admin Dashboard
- Product CRUD
- Order Management
- Order Detail View