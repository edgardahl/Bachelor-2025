import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../../context/UseAuth";
import "./Navbar.css";

export default function Navbar() {
  const { user, setUser, logout: serverLogout } = useAuth();
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
          {user?.role === "store_manager" && (
            <>
              <Link
                to={"/dashboard/butikksjef"}
                onClick={() => setMenuOpen(false)}
              >
                Hjem
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
              <Link
                to={"/dashboard/butikksjef/minprofil"}
                onClick={() => setMenuOpen(false)}
              >
                Profil
              </Link>
            </>
          )}

          {/* Employee-Specific Links */}
          {user?.role === "employee" && (
            <>
              <Link
                to={"/dashboard/butikkansatt"}
                onClick={() => setMenuOpen(false)}
              >
                Hjem
              </Link>
              <Link
                to={"/dashboard/butikkansatt/minevakter"}
                onClick={() => setMenuOpen(false)}
              >
                Vakter
              </Link>
              <Link
                to={"/dashboard/butikkansatt/minprofil"}
                onClick={() => setMenuOpen(false)}
              >
                Profil
              </Link>
            </>
          )}
        </div>
      )}

      <button className="logout-button" onClick={handleLogout}>
        Logg ut
      </button>
    </nav>
  );
}
