import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../../api/axiosInstance";
import ButikkansattCard from "../../../components/Cards/ButikkansattCard/ButikkansattCard";
import KvalifikasjonerFilter from "../../../components/Filter/kvalifikasjonerFilter/kvalifikasjonerFilter";
import Loading from "../../../components/Loading/Loading";
import "./LedigeAnsatte.css";

const LedigeAnsatte = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedQualifications, setSelectedQualifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAvailableEmployees = async () => {
      try {
        const res = await axios.get("/users/available-employees");
        setEmployees(res.data);
        setFilteredEmployees(res.data); // default vis alle
      } catch (err) {
        console.error("Failed to fetch available employees:", err);
        setError("Kunne ikke hente tilgjengelige ansatte.");
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableEmployees();
  }, []);

  // Hver gang filteret endres, filtrer ansatte
  useEffect(() => {
    if (selectedQualifications.length === 0) {
      setFilteredEmployees(employees); // vis alle hvis ingenting er valgt
      return;
    }

    const filtered = employees.filter((emp) => {
      // Sjekk at alle valgte kvalifikasjoner finnes i employee.qualifications
      return selectedQualifications.every((q) =>
        emp.qualifications?.includes(q)
      );
    });

    setFilteredEmployees(filtered);
  }, [selectedQualifications, employees]);

  return (
    <div className="ledige-ansatte">

      <h1 className="ledige-ansatte-title">LEDIGE ANSATTE</h1>
      <div className="ledige-ansatte-beskrivelse">
        <p>
          Her kan du se alle tilgjengelige ansatte som kan jobbe i din butikk. 
        </p>
      </div>
      <div className="kompetanse-filter-container">
        <KvalifikasjonerFilter onChange={setSelectedQualifications} />
      </div>

      {error && <p className="ledige-error-message">{error}</p>}

      {filteredEmployees.length === 0 && !error && (
        <p>Ingen ledige ansatte funnet med de valgte kvalifikasjonene.</p>
      )}
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="ledige-employee-list">
            {filteredEmployees.map((employee) => (
              <Link
                key={employee.user_id}
                to={`/bs/ansatte/profil/${employee.user_id}`}
              >
                <ButikkansattCard employee={employee} cardClass="available-theme" />
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LedigeAnsatte;
