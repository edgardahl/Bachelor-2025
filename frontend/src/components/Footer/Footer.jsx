import React from "react";
import "./Footer.css";
import { MdEmail, MdPhone } from "react-icons/md";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-section">
          <img
            src="/icons/coop-compis-logo-sort.svg"
            alt="Coop Øst Logo"
            className="footer-logo"
          />
        </div>

        <div className="footer-section">
          <h4>Kontakt</h4>
          <p>
            <MdEmail className="footer-icon" />
            support@coop.no
          </p>
          <p>
            <MdPhone className="footer-icon" />
            +47 22 22 22 22
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Coop Øst SA</p>
      </div>
    </footer>
  );
};

export default Footer;
