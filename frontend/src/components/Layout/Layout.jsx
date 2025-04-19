import React from "react";
import { useNavigate } from "react-router-dom";
import "./Layout.css";
import Footer from "../Footer/Footer";
import Navbar from "../Navbar/Navbar";

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Navbar />

      <div className="blob-container">
        <div className="blob"></div>
        <div className="blob"></div>
        <div className="blob"></div>
        <div className="blob"></div>
        <div className="blob"></div>
      </div>

      <main className="layout-content">{children}</main>

      <Footer />
    </div>
  );
};

export default Layout;
