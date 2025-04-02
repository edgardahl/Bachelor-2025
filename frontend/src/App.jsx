import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import ProtectedRoute from './components/Auth/ProtectedRoute';

import LoginPage from './pages/Login/Login';
import RegisterPage from './pages/Register/Register';
import ButikksjefDashboard from './pages/Butikksjef/Dashboard/Dashboard';
import AnsattDashboard from './pages/Butikkansatt/Dashboard/Dashboard';
import useAuth from './context/UseAuth';
import MineVakter from './pages/Butikksjef/MineVakter/MineVakter';

function App() {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  return (
    <>
      {user && <Navbar />}

      <Routes>
        {/* Redirect root based on role */}
        <Route
          path="/"
          element={
            user ? (
              user.role === 'store_manager' ? (
                <Navigate to="/dashboard/butikksjef" replace />
              ) : user.role === 'employee' ? (
                <Navigate to="/dashboard/butikkansatt" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Prevent access to login/register if already logged in */}
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/" replace /> : <RegisterPage />}
        />

        {/* Protected dashboards */}
        <Route
          path="/dashboard/butikksjef"
          element={
            <ProtectedRoute allowedRoles={['store_manager']}>
              <ButikksjefDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/butikkansatt"
          element={
            <ProtectedRoute allowedRoles={['employee']}>
              <AnsattDashboard />
            </ProtectedRoute>
          }
        />

        {/* ✅ Add a separate route for Mine Vakter */}
        <Route
          path="/dashboard/butikksjef/minevakter"
          element={
            <ProtectedRoute allowedRoles={['store_manager']}>
              <MineVakter />
            </ProtectedRoute>
          }
        />
      </Routes>

      {user && <Footer />}
    </>
  );
}

export default App;
