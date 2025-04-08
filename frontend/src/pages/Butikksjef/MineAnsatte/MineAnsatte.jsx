import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../../../api/axiosInstance";
import ButikkansattCard from "../../../components/Cards/ButikkansattCard/ButikkansattCard"; // Import the reusable card component
import "./MineAnsatte.css"; // Import CSS for styling

const MineAnsatte = () => {
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState(""); // Store error message if there's any

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get("/users/myemployees"); // Now it just calls the employees endpoint

        // Directly set the employees data with qualifications
        setEmployees(response.data);
      } catch (err) {
        setError("Failed to load employee data.");
        console.error(err);
      }
    };

    fetchEmployees();
  }, []); // Empty dependency array ensures this runs only once when the component mounts

  if (employees.length === 0 && !error) {
    // Show only the header and the loading spinner when data is still being loaded
    return (
      <div className="mine-ansatte">
        <h1>Mine Ansatte</h1>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="mine-ansatte">
      <h1>Mine Ansatte</h1>
      <p className="mine-ansatte-text">Her kan du se mine ansatte som er tilknyttet min butikk.</p>

      {/* Show error message if there's any */}
      {error && <p className="error-message">{error}</p>}

      {/* Display list of employees using ButikkansattCard */}
      <div className="employee-list">
        {employees.length > 0 ? (
          employees.map((employee) => (
            <Link
              to={`/dashboard/butikksjef/butikkansatt/${employee.user_id}`}
              key={employee.user_id}
            >
              <ButikkansattCard employee={employee} />
            </Link>
          ))
        ) : (
          <p>No employees found.</p>
        )}
      </div>

      {/* Link to go back to Dashboard */}
      <Link to="/dashboard/butikksjef">Tilbake til Dashboard</Link>
    </div>
  );
};

export default MineAnsatte;
