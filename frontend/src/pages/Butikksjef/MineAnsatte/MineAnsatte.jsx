import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../../../api/axiosInstance";
import ButikkansattCard from "../../../components/Cards/ButikkansattCard/ButikkansattCard";
import KvalifikasjonerFilter from "../../../components/Filter/kvalifikasjonerFilter/kvalifikasjonerFilter";
import Loading from "../../../components/Loading/Loading";
import "./MineAnsatte.css";

const PAGE_SIZE = 12;

const MineAnsatte = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedQualifications, setSelectedQualifications] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedEmployees = filteredEmployees.slice(
    0,
    currentPage * PAGE_SIZE
  );

  // Henter alle ansatte for butikksjefen ved komponentmount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/users/employees");
        setEmployees(response.data);
        setFilteredEmployees(response.data);
      } catch (err) {
        console.error("Failed to load employee data:", err);
        setError("Kunne ikke hente ansatte.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Filtrerer og sorterer ansatte ved endring av kvalifikasjoner eller ansattliste
  useEffect(() => {
    const sortByAvailability = (list) =>
      list.sort((a, b) =>
        a.availability === "Fleksibel" && b.availability !== "Fleksibel"
          ? -1
          : a.availability !== "Fleksibel" && b.availability === "Fleksibel"
          ? 1
          : 0
      );

    if (selectedQualifications.length === 0) {
      // Kun sortering uten kvalifikasjonsfilter
      setFilteredEmployees(sortByAvailability([...employees]));
    } else {
      // Filtrering på kvalifikasjoner, deretter sortering
      const filtered = employees.filter((emp) => {
        const kvalifikasjoner = emp.qualifications
          ? emp.qualifications.split(",").map((q) => q.trim())
          : [];
        return selectedQualifications.every((q) =>
          kvalifikasjoner.includes(q)
        );
      });
      setFilteredEmployees(sortByAvailability(filtered));
    }

    setCurrentPage(1); // Resett paginering når filter oppdateres
  }, [selectedQualifications, employees]);

  // Laster inn flere ansatte ved paginering
  const handleShowMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  return (
    <div className="mine-ansatte">
      <h1 className="mine-ansatte-title">MINE ANSATTE</h1>
      <div className="mine-ansatte-beskrivelse">
        <p>
          Se en oversikt over alle ansatte i din butikk, deres kompetanse og
          tilgjengelighet.
        </p>
      </div>

      {/* Filter for å velge ønskede kvalifikasjoner */}
      <KvalifikasjonerFilter onChange={setSelectedQualifications} />

      {error && <p className="error-message">{error}</p>}

      {loading ? (
        <Loading /> // Vis lastespinner mens data hentes
      ) : (
        <>
          <div className="employee-list">
            {/* Kort for å legge til ny ansatt */}
            <Link to="/bs/ansatte/mine/nyAnsatt">
              <ButikkansattCard isEmptyCard={true} cardClass="employee-theme" />
            </Link>

            {paginatedEmployees.length > 0 ? (
              paginatedEmployees.map((employee) => (
                <Link
                  key={employee.user_id}
                  to={`/bs/ansatte/profil/${employee.user_id}`}
                  state={{ fromMineAnsatte: true }}
                >
                  <ButikkansattCard
                    employee={employee}
                    show="availability"
                    showQualifications={true}
                    cardClass="employee-theme"
                  />
                </Link>
              ))
            ) : (
              <p className="no-employee-found">
                Ingen ansatte matcher valgte kvalifikasjoner.
              </p>
            )}
          </div>

          {/* Vis mer-knapp for paginering */}
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

export default MineAnsatte;
