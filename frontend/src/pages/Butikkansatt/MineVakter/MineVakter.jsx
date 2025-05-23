import React, { useEffect, useState } from "react";
import axios from "../../../api/axiosInstance";
import ShiftCard from "../../../components/Cards/ShiftCard/ShiftCard";
import useAuth from "../../../context/UseAuth";
import KommuneFilter from "../../../components/Filter/kommuneFilter/kommuneFilter";
import Loading from "../../../components/Loading/Loading";
import "./MineVakter.css";

// Hovedkomponenten som viser vaktene for ansatte og håndterer filtrering, visning og henting av data
const MineVakterAnsatt = () => {
  const { user } = useAuth();
  const [userId, setUserId] = useState(null);
  const [storeId, setStoreId] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [preferredMunicipalityNames, setPreferredMunicipalityNames] = useState(
    []
  );
  const [selectedMunicipalityIds, setSelectedMunicipalityIds] = useState([]);
  const [selectedMunicipalityNames, setSelectedMunicipalityNames] = useState(
    []
  );
  const [claimedShifts, setClaimedShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("available");

  // useEffect som henter nødvendig data når brukerens data blir tilgjengelig
  useEffect(() => {
    // Funksjon som henter og setter brukerens foretrukne kommuner
    const fetchPreferredMunicipalities = async () => {
      try {
        const res = await axios.get(`/users/${user.id}`);
        setPreferredMunicipalityNames(res.data.work_municipalities || []);
        setSelectedMunicipalityIds(res.data.work_municipalities || []);
        setSelectedMunicipalityNames(res.data.work_municipalities || []);
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };

    // Funksjon som henter vaktene brukeren er kvalifisert for
    const fetchShiftsUserIsQualifiedFor = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/shifts/userIsQualifiedFor");
        setShifts(response.data);
      } catch (error) {
        console.error("Error fetching shifts:", error);
      } finally {
        setLoading(false);
      }
    };

    // Funksjon som henter vaktene brukeren har tatt
    const fetchClaimedShifts = async () => {
      try {
        const respons = await axios.get(`/shifts/claimedByCurrentUser`);
        setClaimedShifts(respons.data.data);
      } catch (error) {
        console.error("Error fetching claimed shifts:", error);
      }
    };

    // Sjekker at brukeren er tilgjengelig før data hentes
    if (user) {
      setUserId(user.id);
      setStoreId(user.storeId);
      fetchPreferredMunicipalities();
      fetchShiftsUserIsQualifiedFor();
      fetchClaimedShifts();
    }
  }, [user]);

  // Funksjon som filtrerer vaktene basert på valgte kommuner
  const filterShiftsByMunicipality = (shiftsToFilter) => {
    return shiftsToFilter.filter((shift) => {
      return selectedMunicipalityIds.length === 0
        ? preferredMunicipalityNames.includes(shift.municipality_name)
        : selectedMunicipalityNames.includes(shift.municipality_name);
    });
  };

  // Bestemmer hvilke vakter som skal vises basert på aktiv tab
  const shiftsToDisplay =
    activeTab === "available"
      ? filterShiftsByMunicipality(shifts) // Filtrerer ledige vakter
      : [...claimedShifts].sort((a, b) => new Date(a.date) - new Date(b.date)); // Sorterer de vaktene som er tatt

  // Grupperer vaktene etter dato
  const groupedShifts = shiftsToDisplay.reduce((acc, shift) => {
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

      <div className="mine-vakter-tab-boxes">
        <button
          className={`mine-vakter-tab-box ${
            activeTab === "available" ? "active" : ""
          }`}
          onClick={() => setActiveTab("available")}
        >
          Finn vakter
        </button>
        <button
          className={`mine-vakter-tab-box ${
            activeTab === "claimed" ? "active" : ""
          }`}
          onClick={() => setActiveTab("claimed")}
        >
          Vakter du har tatt
        </button>
      </div>

      {activeTab === "available" && (
        <KommuneFilter
          userRole={user.role}
          onChange={(selectedIds) => {
            setSelectedMunicipalityIds(selectedIds);
            setSelectedMunicipalityNames(selectedIds);
          }}
          defaultValue={selectedMunicipalityNames}
          userPreferredMunicipalities={preferredMunicipalityNames}
        />
      )}

      <h3 className="mine-vakter-shift-list-title">
        {activeTab === "available"
          ? selectedMunicipalityNames.length > 0
            ? `Vakter i valgte kommuner (${selectedMunicipalityNames.join(
                ", "
              )})`
            : `Vakter i dine foretrukne kommuner (${preferredMunicipalityNames.join(
                ", "
              )})`
          : "Vakter du har tatt"}
      </h3>

      {loading ? (
        <Loading />
      ) : (
        <>
          {Object.keys(groupedShifts).length === 0 ? (
            <p className="mine-vakter-empty-message">
              {activeTab === "available"
                ? "Ingen vakter funnet med dine kvalifikasjoner."
                : "Du har ikke tatt noen vakter enda."}
            </p>
          ) : (
            Object.entries(groupedShifts).map(([date, shiftGroup]) => (
              <div key={date} className="shift-date-group">
                <div className="shift-date-heading-wrapper">
                  <h4 className="shift-date-heading">{date}</h4>
                </div>
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
                      storeChain={shift.store_chain}
                      postedBy={`${shift.posted_by_first_name} ${shift.posted_by_last_name}`}
                      postedById={shift.posted_by_id}
                      userId={userId}
                      usersstoreId={storeId}
                      shiftStoreId={shift.store_id}
                      claimedByName={
                        shift.claimed_by_first_name &&
                        shift.claimed_by_last_name
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
        </>
      )}
    </div>
  );
};

export default MineVakterAnsatt;
