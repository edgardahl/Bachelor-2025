import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../../api/axiosInstance";
import ButikkansattCard from "../../../components/Cards/ButikkansattCard/ButikkansattCard"; // Reusable employee card
import "./LedigeAnsatte.css";

const LedigeAnsatte = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAvailableEmployees = async () => {
      try {
        const res = await axios.get("/users/available-employees");
        setEmployees(res.data);
      } catch (err) {
        console.error("Failed to fetch available employees:", err);
        setError("Kunne ikke hente tilgjengelige ansatte.");
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableEmployees();
  }, []);

  // Show header and loading spinner when loading
  if (loading) {
    return (
      <div className="ledige-ansatte">
        <h1>Ledige Ansatte</h1>
        <div className="spinner"></div>{" "}
        {/* You can customize the spinner here */}
      </div>
    );
  }

  return (
    <div className="ledige-ansatte">
      <h1>Ledige Ansatte</h1>
      <p>
        Her ser du ansatte som både bor i din kommune og ønsker å jobbe i din
        kommune.
      </p>

      {error && <p className="ledige-error-message">{error}</p>}

      {employees.length === 0 && !error && (
        <p>Ingen ledige ansatte funnet i ditt område.</p>
      )}

      <div className="ledige-employee-list">
        {employees.map((employee) => (
          <Link
            key={employee.user_id}
            to={`/bs/ansatte/profil/${employee.user_id}`}
          >
            <ButikkansattCard employee={employee} show="store" />
          </Link>
        ))}
      </div>

      <Link to="/bs/hjem">⬅️ Tilbake til Dashboard</Link>
    </div>
  );
};

export default LedigeAnsatte;
