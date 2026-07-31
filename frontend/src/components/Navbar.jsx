import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar({ cartCount }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm sticky-top">
      <div className="container">
        <Link className="navbar-brand fw-bold fs-4" to="/">
          🛒 MiniShop
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarMain"
          aria-controls="navbarMain"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarMain">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link
                className={`nav-link ${isActive("/") ? "active fw-semibold" : ""}`}
                to="/"
              >
                Home
              </Link>
            </li>

            {/* Admin link — only visible to admin role */}
            {user?.role === "admin" && (
              <li className="nav-item">
                <Link
                  className={`nav-link ${isActive("/admin") ? "active fw-semibold" : ""}`}
                  to="/admin"
                >
                  Admin
                </Link>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-2">
            {/* Cart button */}
            <Link to="/cart" className="btn btn-outline-light position-relative">
              🛍 Keranjang
              {cartCount > 0 && (
                <span
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                  style={{ fontSize: "0.7rem" }}
                >
                  {cartCount}
                  <span className="visually-hidden">items in cart</span>
                </span>
              )}
            </Link>

            {/* Auth section */}
            {user ? (
              <div className="dropdown">
                <button
                  className="btn btn-outline-light dropdown-toggle d-flex align-items-center gap-2"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {/* Avatar initial */}
                  <span
                    className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                    style={{
                      width: 28, height: 28,
                      backgroundColor: "#6366F1",
                      fontSize: "0.8rem",
                      color: "#fff",
                      flexShrink: 0,
                    }}
                  >
                    {user.name[0].toUpperCase()}
                  </span>
                  <span className="d-none d-md-inline" style={{ maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user.name}
                  </span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                  <li>
                    <span className="dropdown-item-text small text-muted">
                      {user.email}
                    </span>
                  </li>
                  <li>
                    <span className="dropdown-item-text small">
                      <span className={`badge ${user.role === "admin" ? "bg-warning text-dark" : "bg-secondary"}`}>
                        {user.role}
                      </span>
                    </span>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  {user.role === "customer" && (
                    <li>
                      <Link className="dropdown-item" to="/orders">
                        📦 Riwayat Pesanan
                      </Link>
                    </li>
                  )}
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      🚪 Keluar
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm rounded-3 px-3">
                Masuk
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
