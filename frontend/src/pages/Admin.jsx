import AddProductModal from "../components/AddProductModal";
import EditProductModal from "../components/EditProductModal";
import { useEffect, useState } from "react";
import api from "../services/api";

function Admin() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeTab, setActiveTab] = useState("products");
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  const fetchProducts = () => {
    api
      .get("/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.log(err));
  };

  const fetchOrders = () => {
    api
      .get("/orders")
      .then((res) => setOrders(res.data))
      .catch((err) => console.log(err));
  };

  const deleteProduct = (id) => {
    if (!confirm("Yakin ingin menghapus produk ini?")) return;

    api
      .delete(`/products/${id}`)
      .then(() => fetchProducts())
      .catch((err) => console.log(err));
  };

  return (
    <div className="container py-4">
      <h1 className="mb-4">🛠 Admin Dashboard</h1>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "products" ? "active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            Produk
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            Pesanan{" "}
            {orders.length > 0 && (
              <span className="badge bg-secondary ms-1">{orders.length}</span>
            )}
          </button>
        </li>
      </ul>

      {/* Products Tab */}
      {activeTab === "products" && (
        <>
          <button
            className="btn btn-success mb-3"
            data-bs-toggle="modal"
            data-bs-target="#addProductModal"
          >
            + Tambah Produk
          </button>

          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Nama</th>
                  <th>Kategori</th>
                  <th>Harga</th>
                  <th>Stock</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>Rp {Number(product.price).toLocaleString("id-ID")}</td>
                    <td>
                      <span
                        className={`badge ${
                          product.stock === 0
                            ? "bg-danger"
                            : product.stock <= 5
                            ? "bg-warning text-dark"
                            : "bg-success"
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-warning btn-sm me-2"
                        data-bs-toggle="modal"
                        data-bs-target="#editProductModal"
                        onClick={() => setSelectedProduct(product)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteProduct(product.id)}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <AddProductModal fetchProducts={fetchProducts} />
          <EditProductModal
            product={selectedProduct}
            fetchProducts={fetchProducts}
          />
        </>
      )}

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <>
          <h4 className="mb-3">Daftar Pesanan</h4>
          {orders.length === 0 ? (
            <p className="text-muted">Belum ada pesanan.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>No. Order</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Tanggal</th>
                    <th>Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <strong>{order.order_number}</strong>
                      </td>
                      <td>
                        Rp {Number(order.total_price).toLocaleString("id-ID")}
                      </td>
                      <td>
                        <span className="badge bg-success">
                          {order.status ?? "pending"}
                        </span>
                      </td>
                      <td>
                        {new Date(order.created_at).toLocaleDateString(
                          "id-ID",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-info btn-sm"
                          data-bs-toggle="modal"
                          data-bs-target="#orderDetailModal"
                          onClick={() => setSelectedOrder(order)}
                        >
                          Lihat
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Order Detail Modal */}
          {selectedOrder && (
            <div
              className="modal fade"
              id="orderDetailModal"
              tabIndex="-1"
              aria-hidden="true"
            >
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">
                      Detail Order — {selectedOrder.order_number}
                    </h5>
                    <button
                      className="btn-close"
                      data-bs-dismiss="modal"
                    ></button>
                  </div>
                  <div className="modal-body">
                    <p>
                      <strong>Tanggal:</strong>{" "}
                      {new Date(selectedOrder.created_at).toLocaleString(
                        "id-ID"
                      )}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span className="badge bg-success">
                        {selectedOrder.status ?? "pending"}
                      </span>
                    </p>
                    <table className="table table-sm table-bordered">
                      <thead className="table-secondary">
                        <tr>
                          <th>Produk</th>
                          <th>Qty</th>
                          <th>Harga Satuan</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items?.map((item) => (
                          <tr key={item.id}>
                            <td>{item.product?.name ?? "—"}</td>
                            <td>{item.quantity}</td>
                            <td>
                              Rp{" "}
                              {Number(item.price).toLocaleString("id-ID")}
                            </td>
                            <td>
                              Rp{" "}
                              {Number(item.subtotal).toLocaleString("id-ID")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="table-dark">
                          <td colSpan="3">
                            <strong>Total</strong>
                          </td>
                          <td>
                            <strong>
                              Rp{" "}
                              {Number(
                                selectedOrder.total_price
                              ).toLocaleString("id-ID")}
                            </strong>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  <div className="modal-footer">
                    <button
                      className="btn btn-secondary"
                      data-bs-dismiss="modal"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Admin;
