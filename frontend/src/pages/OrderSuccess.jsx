import { useLocation, useNavigate, Link } from "react-router-dom";

function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  // Guard: if someone navigates here directly without order data
  if (!order) {
    return (
      <div className="container py-5 text-center">
        <h3>Tidak ada data order.</h3>
        <Link to="/" className="btn btn-primary mt-3">
          Kembali Belanja
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          {/* Success header */}
          <div className="text-center mb-4">
            <div style={{ fontSize: "4rem" }}>✅</div>
            <h2 className="fw-bold text-success mt-2">Order Berhasil!</h2>
            <p className="text-muted">
              Terima kasih telah berbelanja di MiniShop.
            </p>
          </div>

          {/* Order summary card */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-success text-white">
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-semibold">Ringkasan Order</span>
                <span className="badge bg-light text-success fw-bold fs-6">
                  {order.order_number}
                </span>
              </div>
            </div>

            <div className="card-body">
              <p className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
                Tanggal:{" "}
                {new Date(order.created_at).toLocaleString("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>

              {/* Items table */}
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead className="table-light">
                    <tr>
                      <th>Produk</th>
                      <th className="text-center">Qty</th>
                      <th className="text-end">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((item) => (
                      <tr key={item.id}>
                        <td>{item.product?.name ?? "—"}</td>
                        <td className="text-center">{item.quantity}</td>
                        <td className="text-end">
                          Rp {Number(item.subtotal).toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="fw-bold">
                      <td colSpan="2">Total</td>
                      <td className="text-end text-success">
                        Rp{" "}
                        {Number(order.total_price).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="d-flex gap-2 justify-content-center">
            <Link to="/" className="btn btn-primary px-4">
              🛍 Kembali Belanja
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;
