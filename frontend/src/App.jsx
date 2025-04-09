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
import LedigeAnsatte from "./pages/Butikksjef/LedigeAnsatte/LedigeAnsatte";
import CreateShift from "./pages/Butikksjef/CreateShift/CreateShift";
import ButikkOversikt from "./pages/Butikksjef/ButikkOversikt/ButikkOversikt";
import Butikk from "./pages/Butikksjef/Butikk/Butikk";
import Profile from "./pages/Profile/Profile";
import ShiftDetailsPage from "./pages/ShiftDetailsPage/ShiftDetailsPage";

import NotFound from "./pages/NotFound/NotFound";

function App() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // fikse tilbakeknapp !!
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
            <Navigate
              to={user.role === "store_manager" ? "/bs/hjem" : "/ba/hjem"}
              replace
            />
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

      {/* Butikksjef routes */}
      <Route
        path="/bs/hjem"
        element={
          <ProtectedRoute allowedRoles={["store_manager"]}>
            <ButikksjefDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bs/vakter"
        element={
          <ProtectedRoute allowedRoles={["store_manager"]}>
            <MineVakter />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bs/butikker"
        element={
          <ProtectedRoute allowedRoles={["store_manager"]}>
            <ButikkOversikt />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bs/ansatte/mine"
        element={
          <ProtectedRoute allowedRoles={["store_manager"]}>
            <MineAnsatte />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bs/butikker/:store_chain/:name/:store_id"
        element={
          <ProtectedRoute allowedRoles={["store_manager"]}>
            <Butikk />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bs/profil"
        element={
          <ProtectedRoute allowedRoles={["store_manager"]}>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bs/ansatte/profil/:id"
        element={
          <ProtectedRoute allowedRoles={["store_manager"]}>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bs/vakter/lag-vakt"
        element={
          <ProtectedRoute allowedRoles={["store_manager"]}>
            <CreateShift />
          </ProtectedRoute>
        }
      />

      <Route
        path="/bs/ansatte/ledige"
        element={
          <ProtectedRoute allowedRoles={["store_manager"]}>
            <LedigeAnsatte />
          </ProtectedRoute>
        }
      />

      <Route
        path="/bs/vakter/detaljer/:shiftId"
        element={
          <ProtectedRoute allowedRoles={["store_manager"]}>
            <ShiftDetailsPage />
          </ProtectedRoute>
        }
      />

      {/* Butikkansatt routes */}
      <Route
        path="/ba/hjem"
        element={
          <ProtectedRoute allowedRoles={["employee"]}>
            <AnsattDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ba/profil"
        element={
          <ProtectedRoute allowedRoles={["employee"]}>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ba/vakter"
        element={
          <ProtectedRoute allowedRoles={["employee"]}>
            <MineVakterAnsatt />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ba/vakter/detaljer/:shiftId"
        element={
          <ProtectedRoute allowedRoles={["employee"]}>
            <ShiftDetailsPage />
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
