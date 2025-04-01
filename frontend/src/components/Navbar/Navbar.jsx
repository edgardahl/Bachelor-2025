import { useNavigate } from "react-router-dom";
import useAuth from "../../context/UseAuth";

export default function Navbar() {
  const { setUser, logout: serverLogout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await serverLogout();
    setUser(null); // clear context
    localStorage.removeItem("accessToken");
    navigate("/login", { replace: true }); // ✅ smooth redirect
  };

  return (
    <nav className="navbar">
      {/* ... other navbar stuff */}
      <button className="logout-button" onClick={handleLogout}>
        Logg ut
      </button>
    </nav>
  );
}
