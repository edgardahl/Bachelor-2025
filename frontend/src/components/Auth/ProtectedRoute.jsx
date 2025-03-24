import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../context/UseAuth';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      const isOnLoginPage = location.pathname === '/login';

      if (!user || !allowedRoles.includes(user.role)) {
        if (!isOnLoginPage) {
          navigate('/login');
        }
      }
    }
  }, [user, loading, allowedRoles, navigate, location]);

  if (loading) return null;
  return user && allowedRoles.includes(user.role) ? children : null;
}
