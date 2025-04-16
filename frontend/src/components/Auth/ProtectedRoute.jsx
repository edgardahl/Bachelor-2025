import { Navigate, useLocation } from "react-router-dom";
import Loading from "../Loading/Loading";
import useAuth from "../../context/UseAuth";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading)
    return (
      <div>
        <Loading />
      </div>
    );

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
