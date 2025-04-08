import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../../api/axiosInstance";
import ShiftCard from "../../../components/Cards/ShiftCard/ShiftCard";
import "./MineVakter.css";

const MineVakter = () => {
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [storeId, setStoreId] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [activeTab, setActiveTab] = useState("mine");
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const fetchUserAndShifts = async () => {
      try {
        const response = await axios.get("/auth/me");
        const id = response.data.user.id;
        const storeId = response.data.user.storeId;
        const userRole = response.data.user.role;
        setUserRole(userRole);
        setUserId(id);
        setStoreId(storeId);

        fetchShifts("mine", id, storeId);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUserAndShifts();
  }, []);

  const fetchShifts = async (type, userId, storeId) => {
    try {
      let response;
      if (type === "mine") {
        response = await axios.get(`/shifts/posted_by/${userId}`);
      } else {
        response = await axios.get(`/shifts/store/${storeId}`);
        console.log("Mine vakter response:", response.data);
      }
      setShifts(response.data);
    } catch (error) {
      console.error("Error fetching shifts:", error);
    } finally {
      setLoading(false); // Set loading to false once data has been fetched
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    fetchShifts(tab, userId, storeId);
  };

  const deleteShift = (shiftId) => {
    setShifts((prevShifts) =>
      prevShifts.filter((shift) => shift.shift_id !== shiftId)
    );
  };

  // Show header and loading spinner when loading
  if (loading) {
    return (
      <div className="mine-vakter-container">
        <h1 className="mine-vakter-title">Vakter</h1>
        <div className="spinner"></div> {/* You can customize the spinner here */}
      </div>
    );
  }

  return (
    <div className="mine-vakter-container">
      <h1 className="mine-vakter-title">Vakter</h1>

      <div className="mine-vakter-button-group">
        <Link to="/dashboard/butikksjef/createshift">
          <button className="mine-vakter-create-button">
            ➕ Opprett ny vakt
          </button>
        </Link>
        <Link to="/dashboard/butikksjef" className="mine-vakter-back-link">
          ⬅️ Tilbake til Dashboard
        </Link>
      </div>

      <div className="mine-vakter-tabs">
        <button
          className={`mine-vakter-tab ${activeTab === "mine" ? "active" : ""}`}
          onClick={() => handleTabChange("mine")}
        >
          Mine vakter
        </button>
        <button
          className={`mine-vakter-tab ${activeTab === "store" ? "active" : ""}`}
          onClick={() => handleTabChange("store")}
        >
          Alle vakter i butikken
        </button>
      </div>

      <div className="mine-vakter-shift-list">
        <h3 className="mine-vakter-shift-list-title">
          {activeTab === "mine"
            ? "Dine opprettede vakter:"
            : "Alle vakter i butikken:"}
        </h3>
        {shifts.length === 0 ? (
          <p className="mine-vakter-empty-message">Ingen vakter funnet.</p>
        ) : (
          shifts.map((shift) => (
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
              postedBy={
                shift.posted_by_first_name + " " + shift.posted_by_last_name
              }
              postedById={shift.posted_by_id} // Pass the postedById here
              userId={userId} // Pass userId here
              userRole={userRole} // Pass userRole here
              usersstoreId={storeId} // Pass storeId here
              shiftStoreId={shift.store_id} // Pass the storeId from the shift
              deleteShift={deleteShift} // Pass the deleteShift function
            />
          ))
        )}
      </div>
    </div>
  );
};

export default MineVakter;
