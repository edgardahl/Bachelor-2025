import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../../../api/axiosInstance";
import "./MineAnsatte.css"; // Import CSS for styling

const MineAnsatte = () => {
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState(""); // Store error message if there's any
  const [loading, setLoading] = useState(true); // Track if data is loading

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true); // Set loading to true when starting to fetch data
        const response = await axios.get("/users/myemployees");
        const employeesData = response.data;

        // Get user IDs for the RPC call
        const userIds = employeesData.map((employee) => employee.user_id);

        // Fetch qualifications for each employee using RPC
        const qualificationsResponse = await axios.post("/users/myemployees/qualifications", {
          user_ids: userIds,
        });

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
      } finally {
        setLoading(false); // Set loading to false after fetching is complete
      }
    };

    fetchEmployees();
  }, []); // Empty dependency array ensures this runs only once when the component mounts

  if (loading) {
    return <p>Laster inn ansatte..</p>; // Show a loading message while data is being fetched
  }

  return (
    <div className="mine-ansatte">
      <h1>Mine Ansatte</h1>
      <p>Her kan du se mine ansatte som er tilknyttet min butikk.</p>

      {/* Show error message if there's any */}
      {error && <p className="error-message">{error}</p>}

      {/* Display list of employees */}
      <div className="employee-list">
        {employees.length > 0 ? (
          <ul>
            {employees.map((employee) => (
              <li key={employee.user_id}>
                <h3>{employee.first_name} {employee.last_name}</h3>
                <p>Tilgjengelighet: {employee.availability}</p>

                {/* Display qualifications */}
                <p>
                  Kvalifikasjoner:{" "}
                  {employee.qualifications.length > 0 ? (
                    employee.qualifications.join(", ")
                  ) : (
                    <span>No qualifications available</span>
                  )}
                </p>
              </li>
            ))}
          </ul>
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
