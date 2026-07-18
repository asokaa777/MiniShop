import { Link, useLocation } from "react-router-dom";

function Navbar({ cartCount }) {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm sticky-top">
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand fw-bold fs-4" to="/">
          🛒 MiniShop
        </Link>

        {/* Toggler for mobile */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarMain"
          aria-controls="navbarMain"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
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
            <li className="nav-item">
              <Link
                className={`nav-link ${isActive("/admin") ? "active fw-semibold" : ""}`}
                to="/admin"
              >
                Admin
              </Link>
            </li>
          </ul>

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
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
