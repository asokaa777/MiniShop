import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/** Shows a centered spinner while auth state is being restored from localStorage. */
function AuthLoadingSpinner() {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Memuat...</span>
      </div>
    </div>
  );
}

/** Redirects unauthenticated users to /login, preserving the intended destination. */
export function RequireAuth({ children }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <AuthLoadingSpinner />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;

  return children;
}

/** Redirects logged-in users away from /login and /register back to home. */
export function RequireGuest({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <AuthLoadingSpinner />;
  if (user) return <Navigate to="/" replace />;

  return children;
}

/** Redirects non-admin users to home. */
export function RequireAdmin({ children }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <AuthLoadingSpinner />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;

  return children;
}
