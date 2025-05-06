import React from "react";
import "./createShiftConfirmModal.css";

const CreateShiftConfirmModal = ({ shiftData, onCancel, onConfirm }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Er du sikker på at du vil opprette vakten?</h2>

        <div className="modal-two-column">
          {/* Venstre kolonne */}
          <div className="modal-column">
            <div className="modal-field">
              <label>Tittel:</label>
              <p>{shiftData.title}</p>
            </div>

            <div className="modal-field">
              <label>Beskrivelse:</label>
              <p>{shiftData.description}</p>
            </div>

            <div className="modal-field">
              <label>Kvalifikasjoner:</label>
              <div className="qualifications">
                {shiftData.qualifications.map((q, i) => (
                  <span key={i} className="qualification-tag">
                    {q}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Høyre kolonne */}
          <div className="modal-column">
            <div className="modal-field">
              <label>Dato:</label>
              <p>{shiftData.date}</p>
            </div>

            <div className="modal-field">
              <label>Tid:</label>
              <p>{shiftData.start_time} – {shiftData.end_time}</p>
            </div>
          </div>
        </div>

        <div className="modal-buttons center">
          <button onClick={onCancel}>Avbryt</button>
          <button className="confirm" onClick={onConfirm}>Bekreft</button>
        </div>
      </div>
    </div>
  );
};

export default CreateShiftConfirmModal;
