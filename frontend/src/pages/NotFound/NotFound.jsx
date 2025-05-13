import React from "react";
import { Link } from "react-router-dom";
import "./NotFound.css";

// Komponenten viser en 404-feilside når en bruker prøver å navigere til en utdatert eller feilaktig URL.
const NotFound = () => {
  return (
    <div className="not-found-container">
      <h1>404 - Siden ble ikke funnet</h1>
      <p>Beklager, siden du leter etter eksisterer ikke.</p>
      <Link to="/" className="not-found-link">
        Gå tilbake
      </Link>
    </div>
  );
};

export default NotFound;
