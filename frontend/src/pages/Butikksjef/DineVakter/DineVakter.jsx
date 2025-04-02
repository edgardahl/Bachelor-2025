import React from "react";
import { Link } from "react-router-dom";
import "./DineVakter.css";

const DineVakter = () => {
  return (
    <div className="dine-vakter">
      <h1>Dine Vakter</h1>
      <p>Her kan du se dine vakter.</p>

      {/* Add a link to go back to the dashboard */}
      <Link to="/dashboard/butikksjef">Tilbake til Dashboard</Link>
    </div>
  );
};

export default DineVakter;
