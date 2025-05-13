import React from "react"; 
import { useLocation } from "react-router-dom";
import "./Layout.css";
import Footer from "../Footer/Footer";
import Navbar from "../Navbar/Navbar";

const Layout = ({ children }) => {
  const location = useLocation();

  // Skjuler navbar og footer på utvalgte ruter
  const hideNavAndFooter = ["/hjem", "/login", "/register"].includes(
    location.pathname
  );

  return (
    <div className="layout">
      {/* Navigasjonslinje */}
      {!hideNavAndFooter && <Navbar />}

      {/* Animert bakgrunn */}
      <div className="blob-container">
        <div className="blob"></div>
        <div className="blob"></div>
        <div className="blob"></div>
        <div className="blob"></div>
        <div className="blob"></div>
      </div>

      {/* Hovedinnhold */}
      <main className="layout-content">{children}</main>

      {/* Bunntekst */}
      {!hideNavAndFooter && <Footer />}
    </div>
  );
};

export default Layout;
