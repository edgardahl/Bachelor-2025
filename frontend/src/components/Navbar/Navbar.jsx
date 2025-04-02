import { useNavigate } from "react-router-dom";
import useAuth from "../../context/UseAuth";

export default function Navbar() {
  const { setUser, logout: serverLogout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Call logout on the backend
      await serverLogout();
      
      // Clear context
      setUser(null);

      // Remove token from local storage
      localStorage.removeItem("accessToken");

      // Redirect to login page
      navigate("/login", { replace: true }); // ✅ smooth redirect
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <nav className="navbar">
      {/* Add your other navbar items here */}
      <button className="logout-button" onClick={handleLogout}>
        Logg ut
      </button>
    </nav>
  );
}
