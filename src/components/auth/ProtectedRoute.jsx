import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedRoute({ allowedRole }) {
  const location = useLocation();

  const token = localStorage.getItem("yourTaxToken");
  const savedUser = localStorage.getItem("yourTaxUser");

  let user = null;

  try {
    user = savedUser ? JSON.parse(savedUser) : null;
  } catch {
    user = null;
  }

  if (!token || !user || !user.role) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  if (allowedRole && user.role !== allowedRole) {
    const destination =
      user.role === "admin" ? "/admin/dashboard" : "/client/dashboard";

    return <Navigate to={destination} replace />;
  }

  return <Outlet />;
}
