import "./App.css";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import useAuth from "./context/UseAuth";

// Sider (importer alle sider som skal brukes i appen)
import LoginPage from "./pages/Login/Login";
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
import NewEmployeePage from "./pages/Butikksjef/NewEmployeeForm/NewEmployeeForm";
import AdminDashboard from "./pages/Admin/Dashboard/Dashboard";
import AdminButikk from "./pages/Admin/AdminButikk/AdminButikk";
import AdminManagers from "./pages/Admin/AdminManagers/AdminManagers";
import NewManagerPage from "./pages/Admin/NewManagerPage/NewManagerPages";
import NewStorePage from "./pages/Admin/NewStore/NewStore";

import Loading from "./components/Loading/Loading";

import NotFound from "./pages/NotFound/NotFound";
import Landing from "./pages/Landing/Landing";

// Toastify for å vise meldinger
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const { user, loading } = useAuth(); // Henter brukerens informasjon fra konteksten
  const location = useLocation(); // Henter gjeldende URL for å sjekke på enkle ruter

  // Bestemmer om back-button skal vises basert på URLen
  const showBackButton =
    (location.pathname.startsWith("/bs/ansatte/profil/") ||
      location.pathname.startsWith("/admin/butikksjefer/profil/")) &&
    location.pathname.split("/").length >= 4;

  // Hvis brukeren laster, vis en loading screen
  if (loading)
    return (
      <div>
        <Loading />
      </div>
    );

  // Definerer innholdet for appen basert på ruter og brukertilgang
  const appContent = (
    <Routes>
      <Route
        path="/"
        element={
          user ? ( // Sjekker om brukeren er logget inn og navigerer basert på rolle
            user.role === "admin" ? (
              <Navigate to="/admin/hjem" replace />
            ) : user.role === "store_manager" ? (
              <Navigate to="/bs/hjem" replace />
            ) : user.role === "employee" ? (
              <Navigate to="/ba/hjem" replace />
            ) : (
              <Navigate to="/hjem" replace />
            )
          ) : (
            <Navigate to="/hjem" replace />
          )
        }
      />

      {/* Route for login */}

      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginPage />}
      />

      <Route path="/hjem" element={<Landing />} />

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
      <Route
        path="/bs/ansatte/mine/nyAnsatt"
        element={
          <ProtectedRoute allowedRoles={["store_manager"]}>
            <NewEmployeePage />
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
        path="/ba/butikker"
        element={
          <ProtectedRoute allowedRoles={["employee"]}>
            <ButikkOversikt />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ba/butikker/:store_chain/:name/:store_id"
        element={
          <ProtectedRoute allowedRoles={["employee"]}>
            <Butikk />
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

      {/* Admin routes */}
      <Route
        path="/admin/hjem"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/butikker"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <ButikkOversikt />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/butikker/:store_chain/:name/:store_id"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminButikk />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/butikksjefer/ny"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <NewManagerPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/butikksjefer"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminManagers />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/butikker/ny"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <NewStorePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/butikksjefer/profil/:id"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );

  return (
    <>
      {user ? (
        <Layout showBackButton={showBackButton}>{appContent}</Layout>
      ) : (
        appContent
      )}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        pauseOnHover
        theme="colored"
        style={{ marginTop: "70px" }}
      />
    </>
  );
}

export default App;
