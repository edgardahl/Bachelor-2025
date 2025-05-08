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

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/users/employees");
        console.log(response.data);
        setEmployees(response.data);
        setFilteredEmployees(response.data);
      } catch (err) {
        setError("Failed to load employee data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    console.log(
      "Filtering employees with qualifications:",
      selectedQualifications
    );
    if (selectedQualifications.length === 0) {
      setFilteredEmployees(employees);
    } else {
      const filtered = employees.filter((emp) => {
        const kvalifikasjoner = emp.qualifications
          ? emp.qualifications.split(",").map((q) => q.trim())
          : [];
        console.log("Employee qualifications:", kvalifikasjoner);

        return selectedQualifications.every((selectedQualification) =>
          kvalifikasjoner.includes(selectedQualification)
        );
      });

      setFilteredEmployees(filtered);
    }
    setCurrentPage(1); // Reset pagination when filters change
  }, [selectedQualifications, employees]);

  const handleShowMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  return (
    <div className="mine-ansatte">
      <h1 className="mine-ansatte-title">MINE ANSATTE</h1>
      <div className="mine-ansatte-beskrivelse">
        <p>
          Her kan du se en oversikt over alle ansatte i din butikk. Du kan se
          hvilken kompetanse de har og om de er ledige
        </p>
      </div>

      <KvalifikasjonerFilter onChange={setSelectedQualifications} />

      {error && <p className="error-message">{error}</p>}

      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="employee-list">
            <Link to="/bs/ansatte/mine/nyAnsatt">
              <ButikkansattCard isEmptyCard={true} cardClass="employee-theme" />
            </Link>

            {paginatedEmployees.length > 0 ? (
              paginatedEmployees.map((employee) => (
                <Link
                  to={`/bs/ansatte/profil/${employee.user_id}`}
                  state={{ fromMineAnsatte: true }}
                  key={employee.user_id}
                >
                  <ButikkansattCard
                    employee={employee}
                    cardClass="employee-theme"
                  />
                </Link>
              ))
            ) : (
              <p className="no-employee-found">
                Du har ingen ansatte med alle valgte kvalifikasjoner
              </p>
            )}
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

export default MineAnsatte;
