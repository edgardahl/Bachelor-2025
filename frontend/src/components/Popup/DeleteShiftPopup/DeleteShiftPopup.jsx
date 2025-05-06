import React, { useState } from "react";
import SuccessPopup from "../SuccessPopup/SuccessPopup"; // Import SuccessPopup
import ErrorPopup from "../ErrorPopup/ErrorPopup"; // Import ErrorPopup
import "./DeleteShiftPopup.css";

const DeleteShiftPopup = ({ shiftTitle, onCancel, onConfirm }) => {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState(""); // State to hold error message
  const [showSuccessPopup, setShowSuccessPopup] = useState(false); // State for success popup
  const [showErrorPopup, setShowErrorPopup] = useState(false); // State for error popup
  const [errorMessage, setErrorMessage] = useState(""); // Error message for error popup

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setError(""); // Clear error when the user starts typing
  };

  const handleConfirmClick = async (e) => {
    const shiftTitleLower = shiftTitle.toLowerCase();
    const inputValueLower = inputValue.toLowerCase();
    e.stopPropagation(); // Stop the event from propagating
    if (inputValueLower === shiftTitleLower) {
      try {
        await onConfirm(); // Call the onConfirm function
        setShowSuccessPopup(true); // Show success popup
      } catch {
        setErrorMessage("Failed to delete the shift. Please try again."); // Set error message
        setShowErrorPopup(true); // Show error popup
      }
    } else {
      setError(
        "The shift title does not match. Please enter the correct title."
      );
    }
  };

  const handleOverlayClick = (e) => {
    e.stopPropagation(); // Stop the event from propagating when clicking on the overlay
  };

  const handleCloseSuccessPopup = () => {
    setShowSuccessPopup(false);
    onCancel(); // Close the delete popup after the success popup is closed
  };

  const handleCloseErrorPopup = () => {
    setShowErrorPopup(false);
    // Do not call onCancel here, as the delete popup should remain open for retry
  };

  return (
    <div className="delete-popup-overlay" onClick={handleOverlayClick}>
      <div className="delete-popup" onClick={handleOverlayClick}>
        <h3>Bekreft sletting</h3>
        <p>
         Er du sikker på at du vil slette vakten med tittelen: {" "}
          <br /> "<strong>{shiftTitle}</strong>"? 
          <br /> <br />
          Vennligst skriv tittelen under for å bekrefte:
        </p>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Skriv tittelen her"
        />
        {error && <p className="error-message">{error}</p>}{" "}
        {/* Conditionally render error message */}
        <div className="delete-popup-actions">
          <button onClick={onCancel}>Avbryt</button>
          <button onClick={handleConfirmClick}>Bekreft</button>
        </div>
      </div>

      {/* Render success popup */}
      {showSuccessPopup && (
        <SuccessPopup
          message="The shift was successfully deleted."
          onClose={handleCloseSuccessPopup}
        />
      )}

      {/* Render error popup */}
      {showErrorPopup && (
        <ErrorPopup
          errorMessage={errorMessage}
          onClose={handleCloseErrorPopup}
        />
      )}
    </div>
  );
};

export default DeleteShiftPopup;
