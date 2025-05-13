import React from "react";
import { Link } from "react-router-dom";
import "./DashboardCard.css";

// DashboardCard er en gjenbrukbar kortkomponent brukt på dashbordsider.
const DashboardCard = ({
  icon,
  title,
  description,
  statText,
  statValue,
  linkText,
  linkTo,
  themeClass = "",
}) => {
  return (
    <div className={`dashboard-card ${themeClass}`}>
      <Link to={linkTo}>
        <div className="dashboard-cards-icon">{icon}</div>
        <h2>{title}</h2>
        <p className="dashboard-card-description">{description}</p>
        <p className="dashboard-card-stat-text">
          <strong>{statValue}</strong> <br /> {statText}
        </p>
        <div className="dashboard-link-container">
          <p className="dashboard-link">{linkText}</p>
        </div>
      </Link>
    </div>
  );
};

export default DashboardCard;
