import "./App.css";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import useAuth from "./context/UseAuth";

import LoginPage from "./pages/Login/Login";
import RegisterPage from "./pages/Register/Register";
import ButikksjefDashboard from "./pages/Butikksjef/Dashboard/Dashboard";
import AnsattDashboard from "./pages/Butikkansatt/Dashboard/Dashboard";
import MineVakter from "./pages/Butikksjef/MineVakter/MineVakter";
import MineVakterAnsatt from "./pages/Butikkansatt/MineVakter/MineVakter";
import MineAnsatte from "./pages/Butikksjef/MineAnsatte/MineAnsatte";
import CreateShift from "./pages/Butikksjef/CreateShift/CreateShift";
import ButikkOversikt from "./pages/Butikksjef/ButikkOversikt/ButikkOversikt";
import Butikk from "./pages/Butikksjef/Butikk/Butikk";
import Profile from "./pages/Profile/Profile";
import ShiftDetailsPage from "./pages/ShiftDetailsPage/ShiftDetailsPage";

import NotFound from "./pages/NotFound/NotFound";

function App() {
  const { user, loading } = useAuth();
  const location = useLocation();

  const showBackButton =
    location.pathname.startsWith("/dashboard/butikksjef/") &&
    location.pathname.split("/").length > 4;

  if (loading) return <p>Laster inn...</p>;

  const appContent = (
    <Routes>
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

      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/" replace /> : <RegisterPage />}
      />

      {/* General route shared by roles */}
      <Route
        path="/shift-details/:shiftId"
        element={
          <ProtectedRoute allowedRoles={["store_manager", "employee"]}>
            <ShiftDetailsPage />
          </ProtectedRoute>
        }
      />

      {/* Butikksjef routes */}
      <Route
        path="/dashboard/butikksjef"
        element={
          <ProtectedRoute allowedRoles={["store_manager"]}>
            <ButikksjefDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/butikksjef/minevakter"
        element={
          <ProtectedRoute allowedRoles={["store_manager"]}>
            <MineVakter />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/butikksjef/butikker"
        element={
          <ProtectedRoute allowedRoles={["store_manager"]}>
            <ButikkOversikt />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/butikksjef/mineansatte"
        element={
          <ProtectedRoute allowedRoles={["store_manager"]}>
            <MineAnsatte />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/butikksjef/:store_chain/:name/:store_id"
        element={
          <ProtectedRoute allowedRoles={["store_manager"]}>
            <Butikk />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/butikksjef/minprofil"
        element={
          <ProtectedRoute allowedRoles={["store_manager"]}>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/butikksjef/butikkansatt/:id"
        element={
          <ProtectedRoute allowedRoles={["store_manager"]}>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/butikksjef/createshift"
        element={
          <ProtectedRoute allowedRoles={["store_manager"]}>
            <CreateShift />
          </ProtectedRoute>
        }
      />

      {/* Butikkansatt routes */}
      <Route
        path="/dashboard/butikkansatt"
        element={
          <ProtectedRoute allowedRoles={["employee"]}>
            <AnsattDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/butikkansatt/minprofil"
        element={
          <ProtectedRoute allowedRoles={["employee"]}>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/butikkansatt/minevakter"
        element={
          <ProtectedRoute allowedRoles={["employee"]}>
            <MineVakterAnsatt />
          </ProtectedRoute>
        }
      />

      {/* Not Found route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );

  return user ? (
    <Layout showBackButton={showBackButton}>{appContent}</Layout>
  ) : (
    appContent
  );
}

export default App;
