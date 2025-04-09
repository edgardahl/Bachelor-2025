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
      <div className="icon">
        {typeof icon === "string" ? (
          <img src={icon} alt={`${title} icon`} />
        ) : (
          icon
        )}
      </div>
      <h2>{title}</h2>
      <p>{description}</p>
      <p>
        <strong>{statValue}</strong> {statText}
      </p>
      <Link to={linkTo} className="dashboard-link">
        {linkText}
      </Link>
    </div>
  );
};

export default DashboardCard;
