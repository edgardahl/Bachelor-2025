import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../context/UseAuth';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // ✅ Display a loading state (could be a spinner or a loading message) until we verify user data
  if (loading) return <p>Loading...</p>;

  // 🚫 Not logged in
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 🚫 Role not allowed
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ✅ User is authorized
  return children;
}
