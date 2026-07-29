import { useEffect, useRef, useState } from "react";
import { Modal } from "bootstrap";
import ReviewSection from "./ReviewSection";

function StarDisplay({ rating, count }) {
  const num    = Number(rating) || 0;
  const filled = Math.round(num);
  return (
    <div className="d-flex align-items-center gap-1 mb-2">
      <span>
        {[1,2,3,4,5].map((i) => (
          <span key={i} style={{ color: i <= filled ? "#FBBF24" : "#D1D5DB", fontSize: "1.1rem" }}>
            ★
          </span>
        ))}
      </span>
      <span className="fw-bold">{num.toFixed(1)}</span>
      <span className="text-muted small">({count} ulasan)</span>
    </div>
  );
}

function ProductModal({ product, addToCart, onClose }) {
  const modalRef      = useRef(null);
  const modalInstance = useRef(null);

  // Live rating updated by ReviewSection after new review submitted
  const [liveAvg,   setLiveAvg]   = useState(null);
  const [liveCount, setLiveCount] = useState(null);

  // Reset live rating whenever product changes
  useEffect(() => {
    setLiveAvg(null);
    setLiveCount(null);
  }, [product?.id]);

  // Create Bootstrap modal instance once
  useEffect(() => {
    if (modalRef.current) {
      modalInstance.current = new Modal(modalRef.current, {
        backdrop: true,
        keyboard: true,
      });
      modalRef.current.addEventListener("hidden.bs.modal", () => {
        if (onClose) onClose();
      });
    }
    return () => { modalInstance.current?.dispose(); };
  }, []);

  // Show/hide when product changes
  useEffect(() => {
    if (!modalInstance.current) return;
    if (product) modalInstance.current.show();
    else         modalInstance.current.hide();
  }, [product]);

  const outOfStock = product?.stock === 0;

  const displayAvg   = liveAvg   ?? Number(product?.reviews_avg_rating  ?? 0);
  const displayCount = liveCount ?? (product?.reviews_count ?? 0);

  return (
    <div
      ref={modalRef}
      className="modal fade"
      id="productModal"
      tabIndex="-1"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          {product ? (
            <>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">{product.name}</h5>
                <button className="btn-close" data-bs-dismiss="modal" />
              </div>

              <div className="modal-body pt-2">
                {/* Image */}
                <img
                  src={product.image}
                  className="img-fluid rounded-3 mb-3 w-100"
                  alt={product.name}
                  style={{ maxHeight: "280px", objectFit: "cover" }}
                  onError={(e) => { e.target.src = "https://placehold.co/800x280?text=No+Image"; }}
                />

                {/* Meta row */}
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                  <div>
                    <span className="badge bg-secondary me-2">{product.category}</span>
                    <span className={`fw-semibold small ${outOfStock ? "text-danger" : "text-success"}`}>
                      {outOfStock ? "✕ Stok Habis" : `✓ Stok: ${product.stock}`}
                    </span>
                  </div>
                  <h4 className="text-success fw-bold mb-0">
                    Rp {Number(product.price).toLocaleString("id-ID")}
                  </h4>
                </div>

                {/* Rating summary (live) */}
                {displayCount > 0 && (
                  <StarDisplay rating={displayAvg} count={displayCount} />
                )}

                {/* Description */}
                <p className="text-muted small">{product.description}</p>

                <hr />

                {/* Reviews */}
                <ReviewSection
                  productId={product.id}
                  onRatingChange={(avg, count) => {
                    setLiveAvg(avg);
                    setLiveCount(count);
                  }}
                />
              </div>

              <div className="modal-footer border-0">
                <button className="btn btn-secondary" data-bs-dismiss="modal">
                  Tutup
                </button>
                <button
                  className="btn btn-success"
                  disabled={outOfStock}
                  onClick={() => {
                    addToCart(product);
                    modalInstance.current?.hide();
                  }}
                >
                  {outOfStock ? "Stok Habis" : "🛒 Add To Cart"}
                </button>
              </div>
            </>
          ) : (
            <div className="modal-body">
              <p className="text-muted text-center">Memuat...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductModal;
