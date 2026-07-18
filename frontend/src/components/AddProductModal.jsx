import { useState } from "react";
import api from "../services/api";

const emptyForm = {
  name: "",
  price: "",
  description: "",
  image: "",
  category: "",
  stock: "",
};

function AddProductModal({ fetchProducts }) {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveProduct = () => {
    // Guard: prevent double-submit
    if (loading) return;
    setLoading(true);

    api
      .post("/products", form)
      .then(() => {
        fetchProducts();
        setForm(emptyForm);
        document
          .getElementById("addProductModal")
          .querySelector(".btn-close")
          .click();
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="modal fade" id="addProductModal" tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5>Tambah Produk</h5>
            <button className="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <div className="modal-body">
            <input
              className="form-control mb-2"
              name="name"
              placeholder="Nama Produk"
              value={form.name}
              onChange={handleChange}
            />
            <input
              className="form-control mb-2"
              name="price"
              placeholder="Harga"
              type="number"
              value={form.price}
              onChange={handleChange}
            />
            <textarea
              className="form-control mb-2"
              name="description"
              placeholder="Deskripsi"
              value={form.description}
              onChange={handleChange}
            />
            <input
              className="form-control mb-2"
              name="image"
              placeholder="URL Gambar"
              value={form.image}
              onChange={handleChange}
            />
            <input
              className="form-control mb-2"
              name="category"
              placeholder="Kategori"
              value={form.category}
              onChange={handleChange}
            />
            <input
              className="form-control mb-2"
              name="stock"
              placeholder="Stock"
              type="number"
              value={form.stock}
              onChange={handleChange}
            />
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" data-bs-dismiss="modal">
              Tutup
            </button>
            <button
              className="btn btn-success"
              onClick={saveProduct}
              disabled={loading}
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddProductModal;
