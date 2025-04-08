import React from "react";
import "./SuccessPopup.css";

const SuccessPopup = ({ message = "Suksess", onClose }) => {
  return (
    <div className="success-popup-overlay">
      <div className="success-popup">
        <h2>Success</h2>
        <p>{message}</p>
        <button className="close-button" onClick={onClose}>
          Lukk
        </button>
      </div>
    </div>
  );
};

export default SuccessPopup;
