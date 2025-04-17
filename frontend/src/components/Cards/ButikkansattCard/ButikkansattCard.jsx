import React from "react";
import PropTypes from "prop-types";
import "./ButikkansattCard.css";
import { FaBriefcase, FaUser, FaClock, FaMapMarkerAlt } from "react-icons/fa";
import { HiChevronRight } from "react-icons/hi";

const ButikkansattCard = ({ employee, show = "availability", cardClass = "" }) => {
  return (
    <div className={`butikkansatt-card ${cardClass}`}>
      <div className="card-left">
        <FaUser className="icon-user" />
      </div>

      <div className="card-content">
        <h3>{employee.first_name} {employee.last_name}</h3>

        {show === "availability" && (
          <p className="availability">
            <FaClock className="icon" />
            {employee.availability}
          </p>
        )}

        {show === "store" && (
          <p className="store-name">
            <FaMapMarkerAlt className="icon" />
            {employee.store_name || "Uten butikk"}
          </p>
        )}

        <p className="qualifications">
          <FaBriefcase className="icon" />
          {employee.qualifications || "Ingen kvalifikasjoner"}
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
    qualifications: PropTypes.string.isRequired,
  }).isRequired,
  show: PropTypes.oneOf(["availability", "store"]),
};

export default ButikkansattCard;
