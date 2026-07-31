import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form,    setForm]    = useState({ name: "", email: "", phone: "", password: "" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError("Nama, email, dan password wajib diisi.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    setLoading(true);
    try {
      await register(
        form.name.trim(),
        form.email.trim().toLowerCase(),
        form.password,
        form.phone.trim() || undefined,
      );
      navigate("/");
    } catch (err) {
      const firstError = Object.values(err?.response?.data?.errors ?? {})?.[0];
      setError(
        firstError?.[0] ??
        err?.response?.data?.message ??
        "Registrasi gagal. Coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5 col-lg-4">

          <div className="text-center mb-4">
            <span style={{ fontSize: "3rem" }}>🛒</span>
            <h2 className="fw-bold mt-2">Buat Akun Baru</h2>
            <p className="text-muted small">Gratis dan mudah</p>
          </div>

          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body p-4">

              {error && (
                <div className="alert alert-danger py-2 small rounded-3">{error}</div>
              )}

              <form onSubmit={handleSubmit}>
                <FormField label="Nama Lengkap *" type="text"
                  placeholder="Nama kamu" value={form.name}
                  onChange={set("name")} autoComplete="name" />

                <FormField label="Email *" type="email"
                  placeholder="kamu@email.com" value={form.email}
                  onChange={set("email")} autoComplete="email" />

                <FormField label="Nomor HP" type="tel"
                  placeholder="08xx xxxx xxxx" value={form.phone}
                  onChange={set("phone")} autoComplete="tel" />

                <FormField label="Password *" type="password"
                  placeholder="Minimal 8 karakter" value={form.password}
                  onChange={set("password")} autoComplete="new-password" last />

                <button
                  type="submit"
                  className="btn btn-primary w-100 rounded-3 fw-semibold mt-2"
                  disabled={loading}
                  style={{ height: "44px" }}
                >
                  {loading && <span className="spinner-border spinner-border-sm me-2" />}
                  {loading ? "Mendaftar..." : "Daftar"}
                </button>
              </form>

            </div>
          </div>

          <p className="text-center text-muted small mt-3">
            Sudah punya akun?{" "}
            <Link to="/login" className="fw-semibold text-decoration-none">
              Masuk
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}

function FormField({ label, type, placeholder, value, onChange, autoComplete, last }) {
  return (
    <div className={last ? "mb-4" : "mb-3"}>
      <label className="form-label small fw-semibold text-secondary text-uppercase">
        {label}
      </label>
      <input
        type={type}
        className="form-control rounded-3"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
      />
    </div>
  );
}
