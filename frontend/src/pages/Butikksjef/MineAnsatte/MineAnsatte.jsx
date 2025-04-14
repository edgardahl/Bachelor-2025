import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../../../api/axiosInstance";
import ButikkansattCard from "../../../components/Cards/ButikkansattCard/ButikkansattCard";
import KvalifikasjonerFilter from "../../../components/Filter/kvalifikasjonerFilter/kvalifikasjonerFilter";
import "./MineAnsatte.css";

const MineAnsatte = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedQualifications, setSelectedQualifications] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get("/users/myemployees");
        console.log(response.data);
        setEmployees(response.data);
        setFilteredEmployees(response.data); // Init with full list
      } catch (err) {
        setError("Failed to load employee data.");
        console.error(err);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    console.log("Filtering employees with qualifications:", selectedQualifications);
    if (selectedQualifications.length === 0) {
      setFilteredEmployees(employees);
    } else {
      const filtered = employees.filter((emp) => {
        // Split qualifications into an array by comma and trim spaces
        const kvalifikasjoner = emp.qualifications
          ? emp.qualifications.split(",").map((q) => q.trim())
          : [];
        console.log("Employee qualifications:", kvalifikasjoner);
  
        // Check if employee has all the selected qualifications
        return selectedQualifications.every((selectedQualification) =>
          kvalifikasjoner.includes(selectedQualification)
        );
      });
  
      setFilteredEmployees(filtered);
    }
  }, [selectedQualifications, employees]);
  
  
  

  return (
    <div className="mine-ansatte">
      <h1>Mine ansatte</h1>
      <p className="mine-ansatte-text">
        Her kan du se mine ansatte som er tilknyttet min butikk.
      </p>

      {/* Filterkomponent */}
      <div className="butikk-overview-filter-container">
        <KvalifikasjonerFilter onChange={setSelectedQualifications} />
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="employee-list">
        {filteredEmployees.length > 0 ? (
          filteredEmployees.map((employee) => (
            <Link
              to={`/bs/ansatte/profil/${employee.user_id}`}
              key={employee.user_id}
            >
              <ButikkansattCard employee={employee} />
            </Link>
          ))
        ) : (
          <p>Ingen ansatte</p>
        )}
      </div>

      <Link to="/bs/hjem">Tilbake</Link>
    </div>
  );
};

export default MineAnsatte;
