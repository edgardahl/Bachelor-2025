import React from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";

const ButikksjefDashboard = () => {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Butikksjef Dashboard</h1>
      </ header>

      {/* Add a navigation link to the new page */}
      <Link to="/dashboard/butikksjef/minprofil">Min Profil</Link>
      
      <Link to="/dashboard/butikksjef/minevakter">Mine Vakter</Link>
      <Link to="/dashboard/butikksjef/mineansatte">Mine Ansatte</Link>
      <Link to="/dashboard/butikksjef/butikker">Alle Butikker</Link>
      <Link to="/dashboard/butikksjef/LedigeAnsatte">Ledige Ansatte</Link>
    </div>
  );
};

export default ButikksjefDashboard;
