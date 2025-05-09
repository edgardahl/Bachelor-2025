import React from "react";
import PropTypes from "prop-types";
import "./ButikkansattCard.css";
import { FaBriefcase, FaUser, FaClock, FaMapMarkerAlt, FaPlus } from "react-icons/fa";
import { HiChevronRight } from "react-icons/hi";

const ButikkansattCard = ({
  employee,
  show = "availability",
  cardClass = "",
  isEmptyCard = false
}) => {
  if (isEmptyCard) {
    return (
      <div className={`butikkansatt-card ${cardClass} empty-card`}>
        <div className="empty-card-content">
          <FaPlus className="plus-icon" />
          <p>Registrer en ny ansatt</p>
        </div>
      </div>
    );
  }
  

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

      <div className="qualifications">
        <div className="icon-wrapper">
          <FaBriefcase className="icon" />
        </div>
        <p>{employee.qualifications || "Ingen kvalifikasjoner"}</p>
      </div>
</div>

      <div className="card-arrow">
        <HiChevronRight />
      </div>
    </div>
  );
};


export default ButikkansattCard;
