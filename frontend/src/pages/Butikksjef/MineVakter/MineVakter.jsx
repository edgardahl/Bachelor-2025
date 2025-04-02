import React from "react";
import { Link } from "react-router-dom";
import "./MineVakter.css";

const MineVakter = () => {
  return (
    <div className="dine-vakter">
      <h1>Mine Vakter</h1>
      <p>Her kan du se mine vakter.</p>

      {/* Link to Create New Shift Page */}
      <Link to="/dashboard/butikksjef/createshift">
        <button className="create-shift-button">Opprett ny vakt</button>
      </Link>

      {/* Add a link to go back to the dashboard */}
      <Link to="/dashboard/butikksjef">Tilbake til Dashboard</Link>
    </div>
  );
};

export default MineVakter;
