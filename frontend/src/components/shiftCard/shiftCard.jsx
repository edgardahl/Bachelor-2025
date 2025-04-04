// components/ShiftCard.jsx
import React from "react";
import "./ShiftCard.css"; // Optional: style separately

const ShiftCard = ({ shift }) => {
  return (
    <div className="mine-vakter-shift-card">
      <h4 className="mine-vakter-shift-title">{shift.title}</h4>
      <p className="mine-vakter-shift-description">{shift.description}</p>
      <p className="mine-vakter-shift-time">
        {shift.date} | {shift.start_time} - {shift.end_time}
      </p>
    </div>
  );
};

export default ShiftCard;
