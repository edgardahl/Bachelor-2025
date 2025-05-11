import { FaRegUserCircle, FaTimes } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";
import { useState, useRef, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom"; // CHANGED
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

  const employeeLinks = (
    <>
      <NavLink
        to="/ba/hjem"
        className={({ isActive }) => (isActive ? "active" : "")}
        onClick={() => setMenuOpen(false)}
      >
        Hjem
      </NavLink>
      <NavLink
        to="/ba/vakter"
        className={({ isActive }) => (isActive ? "active" : "")}
        onClick={() => setMenuOpen(false)}
      >
        Vakter
      </NavLink>
      <NavLink
        to="/ba/butikker"
        className={({ isActive }) => (isActive ? "active" : "")}
        onClick={() => setMenuOpen(false)}
      >
        Butikker
      </NavLink>
    </>
  );

  const storeManagerLinks = (
    <>
      <NavLink
        to="/bs/hjem"
        className={({ isActive }) => (isActive ? "active" : "")}
        onClick={() => setMenuOpen(false)}
      >
        Hjem
      </NavLink>
      <NavLink
        to="/bs/vakter"
        className={({ isActive }) => (isActive ? "active" : "")}
        onClick={() => setMenuOpen(false)}
      >
        Vakter
      </NavLink>
      <NavLink
        to="/bs/ansatte/mine"
        className={({ isActive }) => (isActive ? "active" : "")}
        onClick={() => setMenuOpen(false)}
      >
        Mine ansatte
      </NavLink>
      <NavLink
        to="/bs/ansatte/ledige"
        className={({ isActive }) => (isActive ? "active" : "")}
        onClick={() => setMenuOpen(false)}
      >
        Ledige ansatte
      </NavLink>
      <NavLink
        to="/bs/butikker"
        className={({ isActive }) => (isActive ? "active" : "")}
        onClick={() => setMenuOpen(false)}
      >
        Butikker
      </NavLink>
    </>
  );

  const adminLinks = (
    <>
      <NavLink
        to="/admin/hjem"
        className={({ isActive }) => (isActive ? "active" : "")}
        onClick={() => setMenuOpen(false)}
      >
        Hjem
      </NavLink>

      <NavLink
        to="/admin/butikker"
        className={({ isActive }) => (isActive ? "active" : "")}
        onClick={() => setMenuOpen(false)}
      >
        Butikker
      </NavLink>

      <NavLink
        to="/admin/managers"
        className={({ isActive }) => (isActive ? "active" : "")}
        onClick={() => setMenuOpen(false)}
      >
        Butikksjefer
      </NavLink>

      <NavLink
        to="/admin/statistikk"
        className={({ isActive }) => (isActive ? "active" : "")}
        onClick={() => setMenuOpen(false)}
      >
        Statistikk
      </NavLink>
    </>
  );

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
        <NavLink to="/" className="home-button desktop-only">
          <img src="/icons/coop-compis-logo-sort.svg" alt="Coop" />
        </NavLink>

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
          {user?.role === "employee"
            ? employeeLinks
            : user?.role === "admin"
            ? adminLinks
            : storeManagerLinks}

          <button className="logout-button mobile-only" onClick={handleLogout}>
            Logg ut
          </button>
        </div>

        <div className="nav-right">
          {user?.role !== "admin" && (
            <>
              <NotificationDropdown />
              <NavLink
                to={user?.role === "employee" ? "/ba/profil" : "/bs/profil"}
                className="profile-icon"
              >
                <FaRegUserCircle size={40} />
              </NavLink>
            </>
          )}
          <button className="logout-button desktop-only" onClick={handleLogout}>
            Logg ut
          </button>
        </div>
      </nav>
    </>
  );
}
