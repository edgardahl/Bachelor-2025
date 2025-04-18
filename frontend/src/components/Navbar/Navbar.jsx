import { FaRegUserCircle, FaTimes } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";
import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../../context/UseAuth";
import NotificationDropdown from "../../components/NotificationDropdown/NotificationDropdown";
import "./Navbar.css";

export default function Navbar() {
  const { setUser, logout: serverLogout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
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

  // Links for roles
  const employeeLinks = (
    <>
      <Link to="/ba/hjem" onClick={() => setMenuOpen(false)}>
        Hjem
      </Link>
      <Link to="/ba/vakter" onClick={() => setMenuOpen(false)}>
        Vakter
      </Link>
      <Link to="/ba/butikker" onClick={() => setMenuOpen(false)}>
        Butikker
      </Link>
    </>
  );

  const storeManagerLinks = (
    <>
      <Link to="/bs/hjem" onClick={() => setMenuOpen(false)}>
        Hjem
      </Link>
      <Link to="/bs/vakter" onClick={() => setMenuOpen(false)}>
        Vakter
      </Link>
      <Link to="/bs/ansatte/mine" onClick={() => setMenuOpen(false)}>
        Mine ansatte
      </Link>
      <Link to="/bs/ansatte/ledige" onClick={() => setMenuOpen(false)}>
        Ledige ansatte
      </Link>
      <Link to="/bs/butikker" onClick={() => setMenuOpen(false)}>
        Butikker
      </Link>
    </>
  );

  // Close menu if clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <>
      {menuOpen && <div className="nav-overlay"></div>}

      <nav className="navbar">
        <Link to="/" className="home-button desktop-only">
          <img src="/icons/coop-compis-logo-sort.svg" alt="Coop" />
        </Link>

        <button
          className="menu-button"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? (
            <FaTimes className="burgermenu" size={30} />
          ) : (
            <GiHamburgerMenu className="burgermenu" size={30} />
          )}
        </button>

        <div className={`nav-links ${menuOpen ? "open" : ""}`} ref={menuRef}>
          {user?.role === "employee" ? employeeLinks : storeManagerLinks}
          <button className="logout-button mobile-only" onClick={handleLogout}>
            Logg ut
          </button>
        </div>

        <div className="nav-right">
          <NotificationDropdown />
          <Link
            to={user?.role === "employee" ? "/ba/profil" : "/bs/profil"}
            className="profile-icon"
          >
            <FaRegUserCircle size={40} />
          </Link>
          <button className="logout-button desktop-only" onClick={handleLogout}>
            Logg ut
          </button>
        </div>
      </nav>
    </>
  );
}
