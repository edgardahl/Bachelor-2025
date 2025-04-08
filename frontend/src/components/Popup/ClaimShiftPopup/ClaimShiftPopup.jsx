import React from "react";
import "./ClaimShiftPopup.css";

const ClaimShiftPopup = ({ shiftTitle, onCancel, onConfirm }) => {
  return (
    <div className="claim-shift-popup-overlay">
      <div className="claim-shift-popup">
        <h2>Bekreft reservasjon</h2>
        <p>
          Er du sikker på at du vil reservere vakten{" "}
          <strong>{shiftTitle}</strong>?
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
