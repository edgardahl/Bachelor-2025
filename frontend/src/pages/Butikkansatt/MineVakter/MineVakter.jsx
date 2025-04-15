import React, { useEffect, useState } from "react";
import axios from "../../../api/axiosInstance";
import ShiftCard from "../../../components/Cards/ShiftCard/ShiftCard";
import useAuth from "../../../context/UseAuth";
import KommuneFilter from "../../../components/Filter/kommuneFilter/kommuneFilter"; // Import the new component
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
      fetchPreferredMunicipalities();
      fetchMunicipalities();
      fetchShiftsUserIsQualifiedFor();
    }
  }, [user]);

  const fetchPreferredMunicipalities = async () => {
    try {
      const res = await axios.get(`/users/${user.id}`);
      setPreferredMunicipalityNames(res.data.work_municipalities || []);
    } catch (err) {
      console.error("Error fetching user profile:", err);
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

  const fetchShiftsUserIsQualifiedFor = async () => {
    try {
      const response = await axios.get("/shifts/user_is_qualified_for");
      setShifts(response.data); // Set all shifts the user is qualified for
    } catch (error) {
      console.error("Error fetching shifts:", error);
    }
  };

  const claimShift = async (shiftId) => {
    try {
      await axios.post(`/shifts/claim/${shiftId}`, { user_id: userId });
      alert("Vakt er nå reservert!");
      if (selectedMunicipalityIds.length > 0) {
        fetchRequestedShifts(selectedMunicipalityIds);
      } else {
        fetchShiftsUserIsQualifiedFor(); // Reload all shifts
      }
    } catch (error) {
      console.error("Error claiming shift:", error);
      alert("Kunne ikke reservere vakt.");
    }
  };

  const filterShiftsByMunicipality = (shifts, selectedMunicipalityNames) => {
    return shifts.filter((shift) => {
      return selectedMunicipalityIds.length === 0
        ? preferredMunicipalityNames.includes(shift.municipality_name)
        : selectedMunicipalityNames.includes(shift.municipality_name);
    });
  };

  const groupedShifts = filterShiftsByMunicipality(shifts, selectedMunicipalityNames).reduce(
    (acc, shift) => {
      const dateKey = new Date(shift.date).toLocaleDateString("no-NO", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(shift);
      return acc;
    },
    {}
  );

  return (
    <div className="mine-vakter-container">
      <h1 className="mine-vakter-title">Vakter</h1>

      {/* Pass the preferred municipalities and selected municipalities state to the KommuneFilter component */}
      <KommuneFilter 
        onChange={(selectedIds) => {
          setSelectedMunicipalityIds(selectedIds);
          setSelectedMunicipalityNames(selectedIds);
        }} 
        defaultValue={selectedMunicipalityNames}
        userPreferredMunicipalities={preferredMunicipalityNames} 
      />

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
                  claimedByName={
                    shift.claimed_by_first_name && shift.claimed_by_last_name
                      ? `${shift.claimed_by_first_name} ${shift.claimed_by_last_name}`
                      : ""
                  }                
                  claimedById={shift.claimed_by_id}
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
