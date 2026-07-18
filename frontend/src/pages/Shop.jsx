import ProductModal from "../components/ProductModal";
import { useState } from "react";

function Shop({ products, addToCart }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const filteredProducts = products.filter((product) => {
    const matchSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchCategory =
      category === "" || product.category === category;
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
              <option key={cat} value={cat}>
                {cat}
              </option>
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
          {filteredProducts.map((product) => (
            <div className="col-md-4 col-sm-6 mb-4" key={product.id}>
              <div className="card h-100 shadow-sm">
                <img
                  src={product.image}
                  className="card-img-top"
                  alt={product.name}
                  style={{ height: "220px", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.src =
                      "https://placehold.co/400x220?text=No+Image";
                  }}
                />
                <div className="card-body">
                  <span className="badge bg-secondary mb-1">
                    {product.category}
                  </span>
                  <h5 className="card-title mt-1">{product.name}</h5>
                  <p className="card-text text-muted small">
                    {product.description?.substring(0, 80)}
                    {product.description?.length > 80 ? "..." : ""}
                  </p>
                  <h5 className="text-success fw-bold">
                    Rp {Number(product.price).toLocaleString("id-ID")}
                  </h5>
                  <p className="mb-0">
                    Stok:{" "}
                    <span
                      className={`fw-semibold ${
                        product.stock === 0
                          ? "text-danger"
                          : product.stock <= 5
                          ? "text-warning"
                          : "text-success"
                      }`}
                    >
                      {product.stock === 0 ? "Habis" : product.stock}
                    </span>
                  </p>
                </div>
                <div className="card-footer bg-white border-top-0 pb-3 d-flex gap-2">
                  <button
                    className="btn btn-outline-primary btn-sm flex-fill"
                    onClick={() => setSelectedProduct(product)}
                  >
                    Detail
                  </button>
                  <button
                    className="btn btn-primary btn-sm flex-fill"
                    disabled={product.stock === 0}
                    onClick={() => addToCart(product)}
                  >
                    {product.stock === 0 ? "Habis" : "+ Keranjang"}
                  </button>
                </div>
              </div>
            </div>
          ))}
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
