import "./App.css";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import ProtectedRoute from "./components/Auth/ProtectedRoute";

import LoginPage from "./pages/Login/Login";
import RegisterPage from "./pages/Register/Register";
import ButikksjefDashboard from "./pages/Butikksjef/Dashboard/Dashboard";
import AnsattDashboard from "./pages/Butikkansatt/Dashboard/Dashboard";
import useAuth from "./context/UseAuth";
import MineVakter from "./pages/Butikksjef/MineVakter/MineVakter";
import CreateShift from "./pages/Butikksjef/CreateShift/CreateShift";
import ButikkOversikt from "./pages/Butikksjef/ButikkOversikt/ButikkOversikt";
import Butikk from "./pages/Butikksjef/Butikk/Butikk";

function App() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Check if the current route matches any of the routes that need a back button
  const showBackButton =
    location.pathname.startsWith("/dashboard/butikksjef/") &&
    location.pathname.split("/").length > 4;

  if (loading) return <p>Loading...</p>;

  return (
    <Layout showBackButton={showBackButton}>
      <Routes>
        {/* Redirect root based on role */}
        <Route
          path="/"
          element={
            user ? (
              user.role === "store_manager" ? (
                <Navigate to="/dashboard/butikksjef" replace />
              ) : user.role === "employee" ? (
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

        {/* BUTIKKSJEF ROUTES */}

        {/* Protected dashboards Butikksjef */}
        <Route
          path="/dashboard/butikksjef"
          element={
            <ProtectedRoute allowedRoles={["store_manager"]}>
              <ButikksjefDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected butikksjef Mine Vakter */}
        <Route
          path="/dashboard/butikksjef/minevakter"
          element={
            <ProtectedRoute allowedRoles={["store_manager"]}>
              <MineVakter />
            </ProtectedRoute>
          }
        />

        {/* Protected butikksjef Butikk Oversikt */}
        <Route
          path="/dashboard/butikksjef/butikker"
          element={
            <ProtectedRoute allowedRoles={["store_manager"]}>
              <ButikkOversikt />
            </ProtectedRoute>
          }
        />

        {/* Protected butikksjef Butikk */}
        <Route
          path="/dashboard/butikksjef/:store_chain/:name/:store_id"
          element={
            <ProtectedRoute allowedRoles={["store_manager"]}>
              <Butikk />
            </ProtectedRoute>
          }
        />

        {/* Protected dashboards Butikkansatt */}
        <Route
          path="/dashboard/butikkansatt"
          element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <AnsattDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected butikksjef Create Shift */}
        <Route
          path="/dashboard/butikksjef/createshift"
          element={
            <ProtectedRoute allowedRoles={["store_manager"]}>
              <CreateShift />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Layout>
  );
}

export default App;
