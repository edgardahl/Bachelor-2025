import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../context/UseAuth";
import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const { setUser, logout: serverLogout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = async () => {
    try {
      await serverLogout();
      setUser(null);
      localStorage.removeItem("accessToken");
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="navbar">
      <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>
        <img src="/icons/menu-list.svg" width="40px" alt="Menu" />
      </button>

      {menuOpen && (
        <div className="dropdown-menu" ref={menuRef}>
          <Link to={"/dashboard/butikksjef"} onClick={() => setMenuOpen(false)}>
            Hjæm
          </Link>

          <Link
            to={"/dashboard/butikksjef/minevakter"}
            onClick={() => setMenuOpen(false)}
          >
            Vakter
          </Link>

          <Link
            to={"/dashboard/butikksjef/mineansatte"}
            onClick={() => setMenuOpen(false)}
          >
            Ansatte
          </Link>
          <Link
            to={"/dashboard/butikksjef/butikker"}
            onClick={() => setMenuOpen(false)}
          >
            Butikker
          </Link>
        </div>
      )}

      <button className="logout-button" onClick={handleLogout}>
        Logg ut
      </button>
    </nav>
  );
}
