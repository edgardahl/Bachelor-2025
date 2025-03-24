import './App.css';
import { Routes, Route } from 'react-router-dom'; // ✅ Removed Router here
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import ProtectedRoute from './components/Auth/ProtectedRoute.jsx';

import LoginPage from './pages/Login/Login.jsx';
import ButikksjefDashboard from './pages/Butikksjef/Dashboard/Dashboard.jsx';
import AnsattDashboard from './pages/Butikkansatt/Dashboard/Dashboard.jsx';

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* ✅ Store Manager Dashboard (Butikksjef) */}
        <Route
          path="/dashboard/butikksjef"
          element={
            <ProtectedRoute allowedRoles={['store_manager']}>
              <ButikksjefDashboard />
            </ProtectedRoute>
          }
        />

        {/* ✅ Store Employee Dashboard (Butikkansatt) */}
        <Route
          path="/dashboard/butikkansatt"
          element={
            <ProtectedRoute allowedRoles={['store_employee']}>
              <AnsattDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>

      <Footer />
    </>
  );
}

export default App;
