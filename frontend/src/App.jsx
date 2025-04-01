import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom'; // ✅ No BrowserRouter here!
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import ProtectedRoute from './components/Auth/ProtectedRoute.jsx';

import LoginPage from './pages/Login/Login.jsx';
import ButikksjefDashboard from './pages/Butikksjef/Dashboard/Dashboard.jsx';
import AnsattDashboard from './pages/Butikkansatt/Dashboard/Dashboard.jsx';
import useAuth from './context/UseAuth';

function App() {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  return (
    <>
      {user && <Navbar />}

      <Routes>
        <Route
          path="/"
          element={
            user ? (
              user.role === 'store_manager' ? (
                <Navigate to="/dashboard/butikksjef" />
              ) : (
                <Navigate to="/dashboard/butikkansatt" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route path="/login" element={<LoginPage />} />

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
            <ProtectedRoute allowedRoles={['store_employee']}>
              <AnsattDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>

      {user && <Footer />}
    </>
  );
}

export default App;
