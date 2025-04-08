// src/components/Cards/ButikkansattCard/ButikkansattCard.jsx
import React from "react";
import PropTypes from "prop-types";
import "./ButikkansattCard.css";
import { FaMapMarkerAlt, FaBriefcase, FaUser, FaClock } from "react-icons/fa";
import { HiChevronRight } from "react-icons/hi";

const ButikkansattCard = ({ employee, show = "store" }) => {
  return (
    <div className="butikkansatt-card">
      <div className="card-left">
        <FaUser className="icon-user" />
      </div>

      <div className="card-content">
        <h3>{employee.first_name} {employee.last_name}</h3>

        {show === "store" && (
          <p className="store-name">
            <FaMapMarkerAlt className="icon" />
            {employee.store_name || "Uten butikk"}
          </p>
        )}

        {show === "availability" && (
          <p className="availability">
            <FaClock className="icon" />
            {employee.availability}
          </p>
        )}

        <p className="qualifications">
          <FaBriefcase className="icon" />
          {employee.qualifications?.length > 0
            ? employee.qualifications
            : "Ingen kvalifikasjoner"}
        </p>
      </div>

      <div className="card-arrow">
        <HiChevronRight />
      </div>
    </div>
  );
};

ButikkansattCard.propTypes = {
  employee: PropTypes.shape({
    user_id: PropTypes.string.isRequired,
    first_name: PropTypes.string.isRequired,
    last_name: PropTypes.string.isRequired,
    availability: PropTypes.string.isRequired,
    store_name: PropTypes.string,
    qualifications: PropTypes.string,
  }).isRequired,
  show: PropTypes.oneOf(["store", "availability"]),
};

export default ButikkansattCard;
