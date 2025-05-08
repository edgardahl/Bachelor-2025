import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../../api/axiosInstance";
import ButikkansattCard from "../../../components/Cards/ButikkansattCard/ButikkansattCard";
import KvalifikasjonerFilter from "../../../components/Filter/kvalifikasjonerFilter/kvalifikasjonerFilter";
import Loading from "../../../components/Loading/Loading";
import "./LedigeAnsatte.css";

const PAGE_SIZE = 12;

const LedigeAnsatte = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedQualifications, setSelectedQualifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedEmployees = filteredEmployees.slice(
    0,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    const fetchAvailableEmployees = async () => {
      try {
        const res = await axios.get("/users/available");
        setEmployees(res.data);
        console.log("Available employees:", res.data);
        setFilteredEmployees(res.data);
      } catch (err) {
        console.error("Failed to fetch available employees:", err);
        setError("Kunne ikke hente tilgjengelige ansatte.");
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableEmployees();
  }, []);

  useEffect(() => {
    if (selectedQualifications.length === 0) {
      setFilteredEmployees(employees);
    } else {
      const filtered = employees.filter((emp) =>
        selectedQualifications.every((q) => emp.qualifications?.includes(q))
      );
      setFilteredEmployees(filtered);
    }
    setCurrentPage(1);
  }, [selectedQualifications, employees]);

  const handleShowMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  return (
    <div className="ledige-ansatte">
      <h1 className="ledige-ansatte-title">LEDIGE ANSATTE</h1>
      <div className="ledige-ansatte-beskrivelse">
        <p>
          Her kan du se alle tilgjengelige ansatte som kan jobbe i din butikk.
        </p>
      </div>

      <KvalifikasjonerFilter onChange={setSelectedQualifications} />

      {error && <p className="ledige-error-message">{error}</p>}

      {filteredEmployees.length === 0 && !error && !loading && (
        <p className="no-employee-found">
          Ingen ledige ansatte funnet med alle valgte kvalifikasjonene.
        </p>
      )}

      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="ledige-employee-list">
            {paginatedEmployees.map((employee) => (
              <Link
                key={employee.user_id}
                to={`/bs/ansatte/profil/${employee.user_id}`}
              >
                <ButikkansattCard
                  employee={employee}
                  cardClass="available-theme"
                />
              </Link>
            ))}
          </div>

          {paginatedEmployees.length < filteredEmployees.length && (
            <div className="show-more-container">
              <button className="show-more-button" onClick={handleShowMore}>
                Vis mer
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LedigeAnsatte;
