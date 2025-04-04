import React from "react";
import { useNavigate } from "react-router-dom";
import "./Layout.css";
import Footer from "../Footer/Footer";
import Navbar from "../Navbar/Navbar";

const Layout = ({ children, showBackButton = false }) => {
  const navigate = useNavigate();

  return (
    <div className="layout">
      <Navbar />

      {showBackButton && (
        <button className="back-button" onClick={() => navigate(-1)}>
          <img
            src="/icons/back-arrow.svg"
            alt="Tilbake"
            width="24"
            height="24"
          />
        </button>
      )}

      <main className="layout-content">{children}</main>

      <Footer />
    </div>
  );
};

export default Layout;
