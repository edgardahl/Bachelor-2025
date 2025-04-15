// src/components/DashboardCard.jsx

import React from "react";
import { Link } from "react-router-dom";
import "./DashboardCard.css"; // You can keep styles separate or merge with Dashboard.css

const DashboardCard = ({
  icon,
  title,
  description,
  statText,
  statValue,
  linkText,
  linkTo,
}) => {
  return (
    <div className="dashboard-card">
      <Link to={linkTo}>
        <div className="dashboard-cards-icon">
          {typeof icon === "string" ? (
            <img src={icon} alt={`${title} icon`} />
          ) : (
            icon
          )}
        </div>
        <h2>{title}</h2>
        <p className="dashboard-card-description">{description}</p>
        <p className="dashboard-card-stat-text">
          <strong>{statValue}</strong> <br /> {statText}
        </p>
        <div className="dashboard-link-container">
          <p to={linkTo} className="dashboard-link">
            {linkText}
          </p>
        </div>
      </Link>
    </div>
  );
};

export default DashboardCard;
