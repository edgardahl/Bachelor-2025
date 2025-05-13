import React from "react";
import "./ClaimShiftPopup.css";

// ClaimShiftPopup-komponent: Vist når en bruker prøver å reservere en vakt.
const ClaimShiftPopup = ({
  shiftTitle,
  date,
  startTime,
  endTime,
  onCancel,
  onConfirm,
}) => {
  // Tar en tid-string og formaterer den til HH:MM format.
  const formatTime = (timeStr) => timeStr?.slice(0, 5);

  return (
    <div className="claim-shift-popup-overlay">
      <div className="claim-shift-popup">
        <h2>Bekreft reservasjon</h2>
        <p className="shift-popup-summary">
          Du er i ferd med å reservere følgende vakt:
        </p>

        <div className="popup-shift-info">
          <p>
            <strong>Tittel:</strong> {shiftTitle}
          </p>
          <p>
            <strong>Dato:</strong> {date}
          </p>
          <p>
            <strong>Tid:</strong> {formatTime(startTime)} -{" "}
            {formatTime(endTime)}
          </p>
        </div>

        <p className="confirm-question">
          Er du sikker på at du vil reservere denne vakten?
        </p>

        <div className="claim-shift-popup-buttons">
          <button className="cancel-button" onClick={onCancel}>
            Avbryt
          </button>
          <button className="confirm-button" onClick={onConfirm}>
            Reserver
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClaimShiftPopup;
