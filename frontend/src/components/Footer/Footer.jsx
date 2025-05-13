import React from "react";
import "./Footer.css";
import { MdEmail, MdPhone } from "react-icons/md";

// Footer-komponent som viser logo, kontaktinformasjon og opphavsrett
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
          <span>
            <MdEmail className="footer-icon" />
            <a href="mailto:support@coop.no">support@coop.no</a>
          </span>
          <span>
            <MdPhone className="footer-icon" />
            <a href="tlf:12345678">12 34 56 78</a>
          </span>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Coop Øst SA</p>
      </div>
    </footer>
  );
};

export default Footer;
