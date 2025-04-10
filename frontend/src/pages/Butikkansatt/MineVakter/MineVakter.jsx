import React, { useEffect, useState } from "react";
import axios from "../../../api/axiosInstance";
import ShiftCard from "../../../components/Cards/ShiftCard/ShiftCard";
import useAuth from "../../../context/UseAuth";
import "./MineVakter.css";

const MineVakterAnsatt = () => {
  const { user } = useAuth();
  const [userId, setUserId] = useState(null);
  const [storeId, setStoreId] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [preferredMunicipalityNames, setPreferredMunicipalityNames] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [selectedMunicipalityName, setSelectedMunicipalityName] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);

  useEffect(() => {
    if (user) {
      setUserId(user.id);
      setStoreId(user.storeId);
      fetchPreferredShifts();
      fetchMunicipalities();
      fetchUserProfile(); // 🟢 Fetch preferred municipalities
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const res = await axios.get(`/users/${user.id}`);
      setPreferredMunicipalityNames(res.data.work_municipalities || []);
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  };

  const fetchPreferredShifts = async () => {
    try {
      const response = await axios.get("/shifts/qualified/preferred");
      setShifts(response.data);
    } catch (error) {
      console.error("Error fetching preferred shifts:", error);
    }
  };

  const fetchRequestedShifts = async (municipalityId) => {
    try {
      const response = await axios.get(`/shifts/qualified/requested/${municipalityId}`);
      setShifts(response.data);
    } catch (error) {
      console.error("Error fetching requested shifts:", error);
    }
  };

  const fetchMunicipalities = async () => {
    try {
      const response = await axios.get("/municipalities");
      setMunicipalities(response.data);
    } catch (error) {
      console.error("Error fetching municipalities:", error);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);

    if (value === "") {
      setFilteredSuggestions([]);
      setSelectedMunicipalityName("");
      fetchPreferredShifts();
      return;
    }

    const filtered = municipalities.filter((m) =>
      m.municipality_name.toLowerCase().startsWith(value.toLowerCase())
    );

    setFilteredSuggestions(filtered);
  };

  const handleSelectSuggestion = (municipality) => {
    setSearchInput(municipality.municipality_name);
    setSelectedMunicipalityName(municipality.municipality_name);
    setFilteredSuggestions([]);
    fetchRequestedShifts(municipality.municipality_id);
  };

  const claimShift = async (shiftId) => {
    try {
      await axios.post(`/shifts/claim/${shiftId}`, { user_id: userId });
      alert("Vakt er nå reservert!");
      const selected = municipalities.find(
        (m) => m.municipality_name === selectedMunicipalityName
      );
      if (selected) {
        fetchRequestedShifts(selected.municipality_id);
      } else {
        fetchPreferredShifts();
      }
    } catch (error) {
      console.error("Error claiming shift:", error);
      alert("Kunne ikke reservere vakt.");
    }
  };

  const groupedShifts = shifts.reduce((acc, shift) => {
    const dateKey = new Date(shift.date).toLocaleDateString("no-NO", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(shift);
    return acc;
  }, {});

  return (
    <div className="mine-vakter-container">
      <h1 className="mine-vakter-title">Vakter</h1>

      <div className="municipality-search">
        <div className="municipality-search-input-wrapper">
          <label htmlFor="municipality-search-input">Søk etter kommune</label>
          <input
            type="text"
            id="municipality-search-input"
            value={searchInput}
            onChange={handleSearchChange}
            placeholder="F.eks. Oslo"
            autoComplete="off"
          />
          {filteredSuggestions.length > 0 && (
            <ul className="suggestions-dropdown">
              {filteredSuggestions.map((m) => (
                <li
                  key={m.municipality_id}
                  onClick={() => handleSelectSuggestion(m)}
                >
                  {m.municipality_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          className="reset-preferred-button"
          onClick={() => {
            setSelectedMunicipalityName("");
            setSearchInput("");
            setFilteredSuggestions([]);
            fetchPreferredShifts();
          }}
        >
          Vis foretrukne kommuner
        </button>
      </div>

      <h3 className="mine-vakter-shift-list-title">
        {selectedMunicipalityName
          ? `Vakter i ${selectedMunicipalityName}`
          : `Vakter i dine foretrukne kommuner (${preferredMunicipalityNames.join(", ")})`}
      </h3>

      {shifts.length === 0 ? (
        <p className="mine-vakter-empty-message">Ingen vakter funnet.</p>
      ) : (
        Object.entries(groupedShifts).map(([date, shiftGroup]) => (
          <div key={date} className="shift-date-group">
            <h4 className="shift-date-heading">{date}</h4>
            <div className="mine-vakter-shift-list">
              {shiftGroup.map((shift) => (
                <ShiftCard
                  key={shift.shift_id}
                  shiftId={shift.shift_id}
                  title={shift.title}
                  description={shift.description}
                  date={shift.date}
                  startTime={shift.start_time}
                  endTime={shift.end_time}
                  qualifications={shift.qualifications}
                  storeName={shift.store_name}
                  postedBy={`${shift.posted_by_first_name} ${shift.posted_by_last_name}`}
                  postedById={shift.posted_by_id}
                  userId={userId}
                  usersstoreId={storeId}
                  shiftStoreId={shift.store_id}
                  actions={
                    <button
                      className="claim-shift-button"
                      onClick={() => claimShift(shift.shift_id)}
                    >
                      Reserver vakt
                    </button>
                  }
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MineVakterAnsatt;
