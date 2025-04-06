import { FaRegCircleUser } from "react-icons/fa6";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../context/UseAuth";
import { Link } from "react-router-dom";
import { FaHamburger, FaTimes } from "react-icons/fa";
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
      <Link to="/dashboard/butikkansatt" onClick={() => setMenuOpen(false)}>
        Dashboard
      </Link>
      <Link to="/dashboard/butikkansatt/minevakter" onClick={() => setMenuOpen(false)}>
        Mine Vakter
      </Link>
      <Link to="/dashboard/butikkansatt/butikker" onClick={() => setMenuOpen(false)}>
        Butikker
      </Link>
    </>
  );

  // Links for store_manager role
  const storeManagerLinks = (
    <>
      <Link to="/dashboard/butikksjef" onClick={() => setMenuOpen(false)}>
        Dashboard
      </Link>
      <Link to="/dashboard/butikksjef/minevakter" onClick={() => setMenuOpen(false)}>
        Mine vakter
      </Link>
      <Link to="/dashboard/butikksjef/mineansatte" onClick={() => setMenuOpen(false)}>
        Mine Ansatte
      </Link>
      <Link to="/dashboard/butikksjef/butikker" onClick={() => setMenuOpen(false)}>
        Alle Butikker
      </Link>
    </>
  );

  return (
    <nav className="navbar">
      {/* Desktop Home logo */}
      <Link to="/dashboard/butikksjef" className="home-button desktop-only">
        <img src="/icons/coop_logo_neg.png" alt="Home" />
      </Link>

      {/* Hamburger button (mobile only) */}
      <button className="menu-button" onClick={() => setMenuOpen((prev) => !prev)}>
        {menuOpen ? <FaTimes size={30} /> : <FaHamburger size={30} />}
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
        <Link to={user?.role === "employee" ? "/dashboard/butikkansatt/minprofil" : "/dashboard/butikksjef/minprofil"} className="profile-icon">
          <FaRegCircleUser size={50} />
        </Link>

        <button className="logout-button desktop-only" onClick={handleLogout}>
          Logg ut
        </button>
      </div>
    </nav>
  );
}
