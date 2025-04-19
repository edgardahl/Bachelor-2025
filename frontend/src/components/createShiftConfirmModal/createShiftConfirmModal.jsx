import React from "react";
import "./createShiftConfirmModal.css";

const CreateShiftConfirmModal = ({ shiftData, onCancel, onConfirm }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Er du sikker på at du vil opprette vakten?</h2>

        <div className="modal-info">
          <div>
            <label>Tittel:</label>
            <p>{shiftData.title}</p>
          </div>

          <div>
            <label>Beskrivelse:</label>
            <p>{shiftData.description}</p>
          </div>

          <div className="row">
            <div>
              <label>Dato:</label>
              <p>{shiftData.date}</p>
            </div>
            <div>
              <label>Fra:</label>
              <p>{shiftData.start_time}</p>
            </div>
            <div>
              <label>Til:</label>
              <p>{shiftData.end_time}</p>
            </div>
          </div>

          <div>
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

        <div className="modal-buttons">
          <button onClick={onCancel}>Avbryt</button>
          <button className="confirm" onClick={onConfirm}>Bekreft</button>
        </div>
      </div>
    </div>
  );
};

export default CreateShiftConfirmModal;
