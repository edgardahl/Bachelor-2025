import React from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";

const ButikksjefDashboard = () => {
  return (
    <div className="dashboard">
      <h1>Butikksjef Dashboard</h1>

      {/* Add a navigation link to the new page */}
      <Link to="/dashboard/butikksjef/minevakter">Mine Vakter</Link>
      <Link to="/dashboard/butikksjef/mineansatte">Mine Ansatte</Link>
      <Link to="/dashboard/butikksjef/butikker">Butikker</Link>
    </div>
  );
};

export default ButikksjefDashboard;
