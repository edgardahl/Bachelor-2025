import React, { useState, useEffect } from "react";
import axios from "../../../api/axiosInstance";
import Loading from "../../../components/Loading/Loading";
import ButikkansattCard from "../../../components/Cards/ButikkansattCard/ButikkansattCard";
import { Link } from "react-router-dom";
import { FaSearch } from "react-icons/fa"; // Importer søkeikonet
import "./AdminManagers.css"; // Importer CSS-filen for styling

const AdminManagers = () => {
  const [managers, setManagers] = useState([]);
  const [filteredManagers, setFilteredManagers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Hent butikksjefene fra API-et
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:5001/api/users/store_managers"
        );
        setManagers(response.data);
        setFilteredManagers(response.data); // Set filtered list to all managers initially
      } catch (err) {
        console.error("Error fetching managers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchManagers();
  }, []);

  // Håndter søkefunksjon
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
  
    if (query === "") {
      setFilteredManagers(managers); // Vis alle hvis søkefeltet er tomt
    } else {
      const filtered = managers.filter((manager) => {
        const fullName = `${manager.first_name} ${manager.last_name}`.toLowerCase();
        const email = manager.email.toLowerCase();
        const storeName = manager.store_name?.toLowerCase() || ""; // Unngå feil hvis den er undefined
        const storeChain = manager.store_chain?.toLowerCase() || ""; // Unngå feil hvis den er undefined
        return (
          fullName.includes(query) ||
          email.includes(query) ||
          storeChain.includes(query) ||
          storeName.includes(query)
        );
      });
  
      setFilteredManagers(filtered);
    }
  };
  

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="admin-manager-page">
      <div className="admin-managers">
      <h1 className="mine-ansatte-title">BUTIKKSJEFER</h1>
      <div className="mine-ansatte-beskrivelse">
        <p>
          Her kan du se en oversikt over alle butikksjefer i systemet. Du kan søke etter en spesifik butikksjef, butikkjede, eller butikk navn.
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
            <Link to="/admin/managers/ny">
              <ButikkansattCard isEmptyCard={true} cardClass="employee-theme" />
            </Link>
          {filteredManagers.length > 0 ? (
            filteredManagers.map((manager) => (
              <Link
                key={manager.user_id}
                to={`/admin/manager/${manager.user_id}`}
              >
                <div key={manager.user_id} className="manager-card">
                  <ButikkansattCard
                    employee={manager}
                    show="store" // For example, you might want to display the store name
                    showQualifications={false} // Adjust as needed
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
    </div>
  );
};

export default AdminManagers;
