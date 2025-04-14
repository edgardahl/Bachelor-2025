import React, { useEffect, useState } from "react";
import axios from "../../../api/axiosInstance";
import ShiftCard from "../../../components/Cards/ShiftCard/ShiftCard";
import useAuth from "../../../context/UseAuth";
import Select from "react-select";
import "./MineVakter.css";

const MineVakterAnsatt = () => {
  const { user } = useAuth();
  const [userId, setUserId] = useState(null);
  const [storeId, setStoreId] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [preferredMunicipalityNames, setPreferredMunicipalityNames] = useState([]);
  const [selectedMunicipalityIds, setSelectedMunicipalityIds] = useState([]);
  const [selectedMunicipalityNames, setSelectedMunicipalityNames] = useState([]);

  useEffect(() => {
    if (user) {
      setUserId(user.id);
      setStoreId(user.storeId);
      fetchPreferredShifts();
      fetchMunicipalities();
      fetchUserProfile();
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

  const fetchRequestedShifts = async (municipalityIds) => {
    try {
      const response = await axios.post("/shifts/qualified/requested", {

        p_municipality_ids: municipalityIds,
        p_user_id: userId,
      });
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

  const claimShift = async (shiftId) => {
    try {
      await axios.post(`/shifts/claim/${shiftId}`, { user_id: userId });
      alert("Vakt er nå reservert!");
      if (selectedMunicipalityIds.length > 0) {
        fetchRequestedShifts(selectedMunicipalityIds);
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
          <label htmlFor="municipality-select">Velg kommune</label>
          <Select
            id="municipality-select"
            options={municipalities.map((m) => ({
              label: m.municipality_name,
              value: m.municipality_id,
            }))}
            value={municipalities
              .filter((m) => selectedMunicipalityIds.includes(m.municipality_id))
              .map((m) => ({
                label: m.municipality_name,
                value: m.municipality_id,
              }))}
            onChange={(selectedOptions) => {
              const selectedIds = selectedOptions.map((opt) => opt.value);
              const selectedNames = selectedOptions.map((opt) => opt.label);
              setSelectedMunicipalityIds(selectedIds);
              setSelectedMunicipalityNames(selectedNames);
              if (selectedIds.length === 0) {
                fetchPreferredShifts();
              } else {
                fetchRequestedShifts(selectedIds);
              }
            }}
            isMulti
            isSearchable
            placeholder="Velg kommune(r)..."
          />
        </div>

        <button
          className="reset-preferred-button"
          onClick={() => {
            setSelectedMunicipalityIds([]);
            setSelectedMunicipalityNames([]);
            fetchPreferredShifts();
          }}
        >
          Vis foretrukne kommuner
        </button>
      </div>

      <h3 className="mine-vakter-shift-list-title">
        {selectedMunicipalityNames.length > 0
          ? `Vakter i valgte kommuner (${selectedMunicipalityNames.join(", ")})`
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
