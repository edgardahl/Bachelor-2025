// src/pages/Butikksjef/MineAnsatte/MineAnsatte.jsx
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
        const response = await axios.get("/users/myemployees");
        const employeesData = response.data;

        // Get user IDs for the RPC call
        const userIds = employeesData.map((employee) => employee.user_id);

        // Fetch qualifications for each employee using RPC
        const qualificationsResponse = await axios.post(
          "/users/myemployees/qualifications/fetch",
          {
            user_ids: userIds,
          }
        );

        const employeesWithQualifications = employeesData.map((employee) => {
          const qualifications = qualificationsResponse.data.filter(
            (q) => q.user_id === employee.user_id
          );
          return {
            ...employee,
            qualifications: qualifications.map((q) => q.qualification_name), // Now qualifications will have the name
          };
        });

        setEmployees(employeesWithQualifications); // Save employees data with qualifications into state
      } catch (err) {
        setError("Failed to load employee data.");
        console.error(err);
      }
    };

    fetchEmployees();
  }, []); // Empty dependency array ensures this runs only once when the component mounts

  return (
    <div className="mine-ansatte">
      <h1>Mine Ansatte</h1>
      <p>Her kan du se mine ansatte som er tilknyttet min butikk.</p>

      {/* Show error message if there's any */}
      {error && <p className="error-message">{error}</p>}

      {/* Display list of employees using ButikkansattCard */}
      <div className="employee-list">
        {employees.length > 0 ? (
          employees.map((employee) => (
            <Link
              to={`/dashboard/butikksjef/ansatt/${employee.user_id}`}
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
