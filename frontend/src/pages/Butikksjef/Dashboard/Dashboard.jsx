import React from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";

const ButikksjefDashboard = () => {
  return (
    <div className="dashboard">
      <h1>Butikksjef Dashboard</h1>
      
      {/* Add a navigation link to the new page */}
      <Link to="/dashboard/butikksjef/vakter">Dine Vakter</Link>
    </div>
  );
};

export default ButikksjefDashboard;
