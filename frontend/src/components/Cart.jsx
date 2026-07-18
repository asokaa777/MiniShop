import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Cart({ cart, setCart, onCheckoutSuccess }) {
  const navigate = useNavigate();

  const updateQty = (id, qty, stock) => {
    const parsed = Number(qty);
    if (parsed < 1) return;
    if (parsed > stock) {
      alert(`Stok tidak mencukupi! Maksimal ${stock}.`);
      return;
    }
    setCart(cart.map((item) => (item.id === id ? { ...item, qty: parsed } : item)));
  };

  const removeItem = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.qty,
    0
  );

  const checkout = () => {
    const data = {
      items: cart.map((item) => ({ id: item.id, qty: item.qty })),
    };

    api
      .post("/orders", data)
      .then((res) => {
        setCart([]);
        // Refresh product list so displayed stock is up-to-date
        if (onCheckoutSuccess) onCheckoutSuccess();
        // Navigate to success page with order data
        navigate("/order-success", { state: { order: res.data.order } });
      })
      .catch((err) => {
        console.error(err);
        const msg =
          err.response?.data?.errors?.stock?.[0] ||
          err.response?.data?.message ||
          "Checkout gagal. Silakan coba lagi.";
        alert(msg);
      });
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4 fw-bold">🛍 Keranjang Belanja</h2>

      {cart.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted fs-5">Keranjang masih kosong.</p>
        </div>
      ) : (
        <div className="row">
          {/* Items list */}
          <div className="col-md-8">
            <div className="card shadow-sm">
              <div className="card-body">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="d-flex align-items-start border-bottom py-3 gap-3"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                      onError={(e) => {
                        e.target.src =
                          "https://placehold.co/80x80?text=No+Img";
                      }}
                    />

                    <div className="flex-grow-1">
                      <h6 className="mb-1 fw-semibold">{item.name}</h6>
                      <p className="mb-1 text-muted small">{item.category}</p>
                      <p className="mb-0 text-success fw-bold">
                        Rp {Number(item.price).toLocaleString("id-ID")}
                      </p>
                    </div>

                    <div className="d-flex flex-column align-items-end gap-2">
                      <div className="d-flex align-items-center gap-1">
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() =>
                            updateQty(item.id, item.qty - 1, item.stock)
                          }
                          disabled={item.qty <= 1}
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={item.stock}
                          value={item.qty}
                          className="form-control form-control-sm text-center"
                          style={{ width: "60px" }}
                          onChange={(e) =>
                            updateQty(item.id, e.target.value, item.stock)
                          }
                        />
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() =>
                            updateQty(item.id, item.qty + 1, item.stock)
                          }
                          disabled={item.qty >= item.stock}
                        >
                          +
                        </button>
                      </div>
                      <small className="text-muted">Stok: {item.stock}</small>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => removeItem(item.id)}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="col-md-4 mt-4 mt-md-0">
            <div className="card shadow-sm">
              <div className="card-header bg-dark text-white">
                Ringkasan Belanja
              </div>
              <div className="card-body">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="d-flex justify-content-between mb-1 small"
                  >
                    <span>
                      {item.name} x{item.qty}
                    </span>
                    <span>
                      Rp{" "}
                      {(Number(item.price) * item.qty).toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
                <hr />
                <div className="d-flex justify-content-between fw-bold">
                  <span>Total</span>
                  <span className="text-success">
                    Rp {total.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
              <div className="card-footer">
                <button
                  className="btn btn-primary w-100"
                  disabled={cart.length === 0}
                  onClick={checkout}
                >
                  Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
