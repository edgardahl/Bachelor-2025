import { FaRegCircleUser } from "react-icons/fa6";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../context/UseAuth";
import { Link } from "react-router-dom";
import { FaTimes, FaRegUserCircle } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";
import NotificationDropdown from "../../components/NotificationDropdown/NotificationDropdown";
import "./Navbar.css";

export default function Navbar() {
  const { setUser, logout: serverLogout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  console.log("User in Navbar:", user.role);

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

  // Dummy links for employee role
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

  // Links for store_manager role
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

  return (
    <nav className="navbar">
      {/* Desktop Home logo */}
      <Link to="/" className="home-button desktop-only">
        <img src="/icons/coop-compis-logo-sort.svg" alt="Coop" />
      </Link>

      {/* Hamburger button (mobile only) */}
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

      {/* Dropdown menu */}
      <div className={`nav-links ${menuOpen ? "open" : ""}`}>
        {user?.role === "employee" ? employeeLinks : storeManagerLinks}

        {/* Logout (mobile only) */}
        <button className="logout-button mobile-only" onClick={handleLogout}>
          Logg ut
        </button>
      </div>

      {/* Profile + Logout (desktop only) */}
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
  );
}
