import ProductModal from "../components/ProductModal";
import { useState } from "react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StarRow({ rating, count }) {
  const num    = Number(rating) || 0;
  const filled = Math.round(num);
  return (
    <div className="d-flex align-items-center gap-1 mb-1">
      <span>
        {[1,2,3,4,5].map((i) => (
          <span key={i} style={{ color: i <= filled ? "#FBBF24" : "#D1D5DB", fontSize: "0.85rem" }}>
            ★
          </span>
        ))}
      </span>
      <span className="small text-muted">{num.toFixed(1)}</span>
      <span className="small text-muted">({count})</span>
    </div>
  );
}

function SmartBadge({ product }) {
  const count = product.reviews_count ?? 0;
  const avg   = Number(product.reviews_avg_rating ?? 0);
  const createdAt = product.created_at ? new Date(product.created_at) : null;
  const daysOld   = createdAt
    ? (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
    : 999;

  if (product.stock === 0) return null;

  if (count >= 10 && avg >= 4.5)
    return <span className="badge mb-1" style={{ backgroundColor: "#FFF7ED", color: "#C2410C", border: "1px solid #FDBA74" }}>🔥 Best Seller</span>;
  if (daysOld <= 14)
    return <span className="badge mb-1" style={{ backgroundColor: "#F0FDF4", color: "#15803D", border: "1px solid #86EFAC" }}>✨ New</span>;
  if (count >= 5 && avg >= 4.0)
    return <span className="badge mb-1" style={{ backgroundColor: "#FEF3C7", color: "#B45309", border: "1px solid #FCD34D" }}>⭐ Popular</span>;

  return null;
}

// ─── Component ────────────────────────────────────────────────────────────────

function Shop({ products, addToCart }) {
  const [search,          setSearch]          = useState("");
  const [category,        setCategory]        = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const filteredProducts = products.filter((product) => {
    const matchSearch   = product.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "" || product.category === category;
    return matchSearch && matchCategory;
  });

  const categories = [...new Set(products.map((p) => p.category))];

  return (
    <div className="container py-4">
      <h2 className="mb-4 fw-bold">Katalog Produk</h2>

      {/* Search & Filter */}
      <div className="row g-2 mb-4">
        <div className="col-md-8">
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Product grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <p className="fs-5">Produk tidak ditemukan.</p>
        </div>
      ) : (
        <div className="row">
          {filteredProducts.map((product) => {
            const hasRating = (product.reviews_count ?? 0) > 0;
            const outOfStock = product.stock === 0;

            return (
              <div className="col-md-4 col-sm-6 mb-4" key={product.id}>
                <div className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden">
                  {/* Image */}
                  <div className="position-relative">
                    <img
                      src={product.image}
                      className="card-img-top"
                      alt={product.name}
                      style={{ height: "200px", objectFit: "cover" }}
                      onError={(e) => {
                        e.target.src = "https://placehold.co/400x200?text=No+Image";
                      }}
                    />
                    {/* Category overlay */}
                    <span
                      className="position-absolute top-0 start-0 m-2 badge"
                      style={{ backgroundColor: "rgba(0,0,0,0.65)", fontSize: "0.7rem" }}
                    >
                      {product.category}
                    </span>
                    {/* Out of stock overlay */}
                    {outOfStock && (
                      <div
                        className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                        style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
                      >
                        <span className="badge bg-danger fs-6">Stok Habis</span>
                      </div>
                    )}
                  </div>

                  <div className="card-body d-flex flex-column pb-2">
                    {/* Smart badge */}
                    <SmartBadge product={product} />

                    <h6 className="card-title fw-semibold mb-1">{product.name}</h6>

                    {/* Rating */}
                    {hasRating ? (
                      <StarRow
                        rating={product.reviews_avg_rating}
                        count={product.reviews_count}
                      />
                    ) : (
                      <p className="text-muted small fst-italic mb-1">Belum ada ulasan</p>
                    )}

                    <p className="card-text text-muted small flex-grow-1">
                      {product.description?.substring(0, 75)}
                      {product.description?.length > 75 ? "..." : ""}
                    </p>

                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <span className="fw-bold text-success">
                        Rp {Number(product.price).toLocaleString("id-ID")}
                      </span>
                      <span className={`small fw-semibold ${
                        outOfStock ? "text-danger" : product.stock <= 5 ? "text-warning" : "text-success"
                      }`}>
                        {outOfStock ? "Habis" : `Stok: ${product.stock}`}
                      </span>
                    </div>
                  </div>

                  <div className="card-footer bg-white border-0 pt-0 pb-3 px-3 d-flex gap-2">
                    <button
                      className="btn btn-outline-primary btn-sm flex-fill"
                      onClick={() => setSelectedProduct(product)}
                    >
                      Detail
                    </button>
                    <button
                      className="btn btn-primary btn-sm flex-fill"
                      disabled={outOfStock}
                      onClick={() => addToCart(product)}
                    >
                      {outOfStock ? "Habis" : "+ Keranjang"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Product Detail Modal */}
      <ProductModal
        product={selectedProduct}
        addToCart={addToCart}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}

export default Shop;
