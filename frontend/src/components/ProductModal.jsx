import { useEffect, useRef } from "react";
import { Modal } from "bootstrap";

function ProductModal({ product, addToCart, onClose }) {
  const modalRef = useRef(null);
  const modalInstance = useRef(null);

  // Create Bootstrap modal instance once — DOM is always mounted
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

    // Cleanup on unmount
    return () => {
      modalInstance.current?.dispose();
    };
  }, []);

  // Show/hide whenever selected product changes
  useEffect(() => {
    if (!modalInstance.current) return;

    if (product) {
      modalInstance.current.show();
    } else {
      modalInstance.current.hide();
    }
  }, [product]);

  const outOfStock = product?.stock === 0;

  // Always render the modal DOM — Bootstrap needs it mounted to initialise
  return (
    <div
      ref={modalRef}
      className="modal fade"
      id="productModal"
      tabIndex="-1"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          {product ? (
            <>
              <div className="modal-header">
                <h4 className="modal-title">{product.name}</h4>
                <button
                  className="btn-close"
                  data-bs-dismiss="modal"
                ></button>
              </div>

              <div className="modal-body">
                <img
                  src={product.image}
                  className="img-fluid rounded mb-3 w-100"
                  alt={product.name}
                  style={{ maxHeight: "320px", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.src =
                      "https://placehold.co/800x320?text=No+Image";
                  }}
                />

                <div className="row">
                  <div className="col-md-6">
                    <p>
                      <strong>Kategori:</strong>{" "}
                      <span className="badge bg-secondary">
                        {product.category}
                      </span>
                    </p>
                    <p>
                      <strong>Stok:</strong>{" "}
                      <span
                        className={`fw-semibold ${
                          outOfStock ? "text-danger" : "text-success"
                        }`}
                      >
                        {outOfStock ? "Habis" : product.stock}
                      </span>
                    </p>
                  </div>
                  <div className="col-md-6 text-md-end">
                    <h3 className="text-success fw-bold">
                      Rp {Number(product.price).toLocaleString("id-ID")}
                    </h3>
                  </div>
                </div>

                <hr />
                <p className="text-muted">{product.description}</p>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
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
            // Empty placeholder while no product is selected
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
