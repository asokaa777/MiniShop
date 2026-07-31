import { useEffect, useState } from "react";
import api from "../services/api";

export default function OrdersPage() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/orders/mine")
      .then((res) => setOrders(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-4">📦 Riwayat Pesanan</h2>

      {orders.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <p className="fs-5">Belum ada pesanan.</p>
        </div>
      ) : (
        <div className="row">
          {orders.map((order) => (
            <div key={order.id} className="col-12 mb-3">
              <div className="card shadow-sm border-0 rounded-4">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold">{order.order_number}</span>
                    <span className="badge bg-success">{order.status}</span>
                  </div>
                  <p className="text-muted small mb-2">
                    {new Date(order.created_at).toLocaleDateString("id-ID", {
                      day: "2-digit", month: "long", year: "numeric",
                    })}
                  </p>
                  <div className="table-responsive">
                    <table className="table table-sm mb-0">
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
                          <td colSpan={2}>Total</td>
                          <td className="text-end text-success">
                            Rp {Number(order.total_price).toLocaleString("id-ID")}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
