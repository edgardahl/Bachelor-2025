import React, { useState } from "react";
import "./ConfirmDeletePopup.css"; // Gjør om filnavnet også til f.eks. ConfirmDeletePopup.css

const ConfirmDeletePopup = ({
  title,
  itemName,
  onCancel,
  onConfirm,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setError("");
    setStatusMessage("");
  };

  const handleConfirmClick = async (e) => {
    e.stopPropagation();
    if (inputValue.trim().toLowerCase() === itemName.trim().toLowerCase()) {
      try {
        await onConfirm();
        onCancel(); // Lukk popup ved suksess
      } catch (err) {
        setStatusMessage("Sletting feilet. Vennligst prøv igjen.");
      }
    } else {
      setError(`Navnet matcher ikke. Skriv "${itemName}" for å bekrefte.`);
    }
  };

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
          <button className="cancel-btn" onClick={onCancel}>Avbryt</button>
          <button className="confirm-btn" onClick={handleConfirmClick}>Bekreft</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeletePopup;
