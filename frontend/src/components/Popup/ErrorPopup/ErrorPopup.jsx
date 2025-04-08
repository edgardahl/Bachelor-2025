import React from "react";
import "./ErrorPopup.css";

const ErrorPopup = ({ errorMessage, onClose }) => {
  return (
    <div className="error-popup-overlay">
      <div className="error-popup">
        <h2>Feil</h2>
        <p>{errorMessage}</p>
        <button className="close-button" onClick={onClose}>
          Lukk
        </button>
      </div>
    </div>
  );
};

export default ErrorPopup;
