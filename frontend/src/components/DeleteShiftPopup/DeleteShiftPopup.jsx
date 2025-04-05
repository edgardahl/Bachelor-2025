import React, { useState } from "react";
import "./DeleteShiftPopup.css";

const DeleteShiftPopup = ({ shiftTitle, onCancel, onConfirm }) => {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState(""); // State to hold error message

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setError(""); // Clear error when the user starts typing
  };

  const handleConfirmClick = (e) => {
    //make input and title case insensitive
    const shiftTitleLower = shiftTitle.toLowerCase();
    const inputValueLower = inputValue.toLowerCase();
    e.stopPropagation(); // Stop the event from propagating
    if (inputValueLower === shiftTitleLower) {
      onConfirm();
    } else {
      setError("The shift title does not match. Please enter the correct title.");
    }
  };

  const handleOverlayClick = (e) => {
    e.stopPropagation(); // Stop the event from propagating when clicking on the overlay
  };

  return (
    <div className="delete-popup-overlay" onClick={handleOverlayClick}>
      <div className="delete-popup" onClick={handleOverlayClick}>
        <h3>Confirm Deletion</h3>
        <p>
          Are you sure you want to delete the shift titled <strong>{shiftTitle}</strong>? Please type the title below to confirm:
        </p>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Enter shift title"
        />
        {error && <p className="error-message">{error}</p>} {/* Conditionally render error message */}
        <div className="delete-popup-actions">
          <button onClick={onCancel}>Cancel</button>
          <button onClick={handleConfirmClick}>Confirm</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteShiftPopup;
