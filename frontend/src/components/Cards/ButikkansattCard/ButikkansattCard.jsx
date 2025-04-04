// src/components/Cards/ButikkansattCard/ButikkansattCard.jsx
import React from "react";
import PropTypes from "prop-types";
import "./ButikkansattCard.css"

const ButikkansattCard = ({ employee }) => {
  return (
    <div className="butikkansatt-card">
      <h3>{employee.first_name} {employee.last_name}</h3>
      <p>Tilgjengelighet: {employee.availability}</p>

      {/* Display qualifications */}
      <p>
        Kvalifikasjoner:{" "}
        {employee.qualifications.length > 0 ? (
          employee.qualifications.join(", ")
        ) : (
          <span>No qualifications available</span>
        )}
      </p>
    </div>
  );
};

ButikkansattCard.propTypes = {
  employee: PropTypes.shape({
    user_id: PropTypes.string.isRequired,
    first_name: PropTypes.string.isRequired,
    last_name: PropTypes.string.isRequired,
    availability: PropTypes.string.isRequired,
    qualifications: PropTypes.array.isRequired,
  }).isRequired,
};

export default ButikkansattCard;
