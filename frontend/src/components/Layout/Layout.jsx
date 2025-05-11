import React from "react";
import { useLocation } from "react-router-dom";
import "./Layout.css";
import Footer from "../Footer/Footer";
import Navbar from "../Navbar/Navbar";

const Layout = ({ children }) => {
  const location = useLocation();

  // Add any routes here where you want to hide navbar/footer
  const hideNavAndFooter = ["/hjem", "/login", "/register"].includes(location.pathname);

  return (
    <div className="layout">
      {!hideNavAndFooter && <Navbar />}

      <div className="blob-container">
        <div className="blob"></div>
        <div className="blob"></div>
        <div className="blob"></div>
        <div className="blob"></div>
        <div className="blob"></div>
      </div>

      <main className="layout-content">{children}</main>

      {!hideNavAndFooter && <Footer />}
    </div>
  );
};

export default Layout;
