import React, { useState, useEffect } from "react";
import axios from "../../../api/axiosInstance";
import Loading from "../../../components/Loading/Loading";
import ButikkansattCard from "../../../components/Cards/ButikkansattCard/ButikkansattCard";
import { Link } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import "./AdminManagers.css";

const PAGE_SIZE = 12;

const AdminManagers = () => {
  const [managers, setManagers] = useState([]);
  const [filteredManagers, setFilteredManagers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedManagers = filteredManagers.slice(0, currentPage * PAGE_SIZE);

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/users/store_managers");
        setManagers(response.data);
        setFilteredManagers(response.data);
      } catch (err) {
        console.error("Error fetching managers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchManagers();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query === "") {
      setFilteredManagers(managers);
    } else {
      const filtered = managers.filter((manager) => {
        const fullName = `${manager.first_name} ${manager.last_name}`.toLowerCase();
        const email = manager.email.toLowerCase();
        const storeName = manager.store_name?.toLowerCase() || "";
        const storeChain = manager.store_chain?.toLowerCase() || "";
        return (
          fullName.includes(query) ||
          email.includes(query) ||
          storeChain.includes(query) ||
          storeName.includes(query)
        );
      });

      setFilteredManagers(filtered);
    }

    setCurrentPage(1); // reset pagination on search
  };

  const handleShowMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  if (loading) return <Loading />;

  return (
    <div className="admin-manager-page">
      <div className="admin-managers">
        <h1 className="mine-ansatte-title">BUTIKKSJEFER</h1>
        <div className="mine-ansatte-beskrivelse">
          <p>
            Oversikt over alle butikksjefer i systemet. Her kan du registrere ny
            butikksjef.
          </p>
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Søk etter butikksjef..."
            value={searchQuery}
            onChange={handleSearch}
            className="search-input"
          />
          <FaSearch className="search-icon" />
        </div>

        <div className="manager-list">
          <Link to="/admin/butikksjefer/ny">
            <ButikkansattCard isEmptyCard={true} cardClass="employee-theme" />
          </Link>

          {paginatedManagers.length > 0 ? (
            paginatedManagers.map((manager) => (
              <Link
                key={manager.user_id}
                to={`/admin/butikksjefer/profil/${manager.user_id}`}
              >
                <div className="manager-card">
                  <ButikkansattCard
                    employee={manager}
                    show="store"
                    showQualifications={false}
                    cardClass="employee-theme"
                  />
                </div>
              </Link>
            ))
          ) : (
            <p className="no-managers-found">Ingen butikksjefer funnet.</p>
          )}

        </div>
      </div>
      {paginatedManagers.length < filteredManagers.length && (
        <div className="show-more-container">
          <button className="show-more-button" onClick={handleShowMore}>
            Vis mer
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminManagers;
