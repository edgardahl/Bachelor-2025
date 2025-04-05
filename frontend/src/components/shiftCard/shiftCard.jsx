import React from "react";
import { useNavigate } from "react-router-dom"; // Use useNavigate for navigation in React Router v6
import "./ShiftCard.css";

const ShiftCard = ({
  shiftId,
  title,
  description,
  date,
  startTime,
  endTime,
  qualifications,
  storeName
}) => {
  const navigate = useNavigate(); // Initialize navigate function

  const handleCardClick = () => {
    // Navigate to the details page for this shift
    navigate(`/shift-details/${shiftId}`);
  };

  return (
    <div className="shift-card-container" onClick={handleCardClick}>
      <div className="shift-card-header">
        <h4 className="shift-card-title">{title}</h4>
      </div>

      <div className="shift-card-details">
        <p className="shift-card-store">{storeName}</p>
        <p className="shift-card-time">
          {date} | {startTime} - {endTime}
        </p>
        <p className="shift-card-qualifications">
          Qualifications: {qualifications.join(", ")}
        </p>
      </div>
    </div>
  );
};

export default ShiftCard;
