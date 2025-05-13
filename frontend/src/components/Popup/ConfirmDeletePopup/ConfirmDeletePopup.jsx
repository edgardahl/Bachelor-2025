import React, { useState } from "react";
import "./ConfirmDeletePopup.css";

// Komponent som håndterer popup-vinduet for sletting
const ConfirmDeletePopup = ({ title, itemName, onCancel, onConfirm }) => {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  // Håndterer endring av inputfeltet og resetter feilmeldinger
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setError("");
    setStatusMessage("");
  };

  // Håndterer bekreftelse av sletting når brukeren trykker på bekreft-knappen
  const handleConfirmClick = async (e) => {
    e.stopPropagation(); // Forhindrer at klikk på knappen lukker popupen
    // Bekrefter at inputverdi er lik objektets navn før sletting skjer
    if (inputValue.trim().toLowerCase() === itemName.trim().toLowerCase()) {
      try {
        await onConfirm(); // Utfører sletting
        onCancel(); // Lukker popupen etter bekreftelse
      } catch {
        setStatusMessage("Sletting feilet. Vennligst prøv igjen.");
      }
    } else {
      setError(`Navnet matcher ikke. Skriv "${itemName}" for å bekrefte.`);
    }
  };

  // Hindrer at klikk på overlay lukker popupen
  const handleOverlayClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="confirm-delete-overlay" onClick={handleOverlayClick}>
      <div className="confirm-delete-popup" onClick={handleOverlayClick}>
        <h3 className="popup-title">Bekreft sletting av {title}</h3>
        <p className="popup-description">
          Er du sikker på at du vil slette {title} med navnet: <br />
          <strong>"{itemName}"</strong>?
        </p>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={`Skriv "${itemName}" her`}
          className="popup-input"
        />
        {error && <p className="error-message">{error}</p>}
        {statusMessage && <p className="status-message">{statusMessage}</p>}
        <div className="popup-actions">
          <button className="cancel-btn" onClick={onCancel}>
            Avbryt
          </button>
          <button className="confirm-btn" onClick={handleConfirmClick}>
            Bekreft
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeletePopup;
