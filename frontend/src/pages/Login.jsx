import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const returnTo   = location.state?.from ?? "/";

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      navigate(returnTo, { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.errors?.email?.[0] ??
        err?.response?.data?.message ??
        "Login gagal. Periksa email dan password."
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
            <h2 className="fw-bold mt-2">Masuk ke MiniShop</h2>
            <p className="text-muted small">Masuk untuk mulai belanja</p>
          </div>

          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body p-4">

              {error && (
                <div className="alert alert-danger py-2 small rounded-3">{error}</div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary text-uppercase">
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-control rounded-3"
                    placeholder="kamu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold text-secondary text-uppercase">
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control rounded-3"
                    placeholder="Minimal 8 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 rounded-3 fw-semibold"
                  disabled={loading}
                  style={{ height: "44px" }}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm me-2" />
                  ) : null}
                  {loading ? "Masuk..." : "Masuk"}
                </button>
              </form>

            </div>
          </div>

          <p className="text-center text-muted small mt-3">
            Belum punya akun?{" "}
            <Link to="/register" className="fw-semibold text-decoration-none">
              Daftar sekarang
            </Link>
          </p>

          {/* Admin hint */}
          <div className="text-center mt-2">
            <small className="text-muted">
              Admin: <code>admin@minishop.com</code> / <code>admin123</code>
            </small>
          </div>

        </div>
      </div>
    </div>
  );
}
