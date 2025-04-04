import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../../api/axiosInstance";
import "./MineVakter.css";

const MineVakter = () => {
  const [userId, setUserId] = useState(null);
  const [storeId, setStoreId] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [activeTab, setActiveTab] = useState("mine"); // "mine" or "store"

  useEffect(() => {
    const fetchUserAndShifts = async () => {
      try {
        const response = await axios.get("/auth/me");
        const id = response.data.user.id;
        const storeId = response.data.user.storeId;
        setUserId(id);
        setStoreId(storeId);

        // Default fetch
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
      }
      setShifts(response.data);
    } catch (error) {
      console.error("Error fetching shifts:", error);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    fetchShifts(tab, userId, storeId);
  };

  return (
    <div className="mine-vakter-container">
      <h1 className="mine-vakter-title">Vakter</h1>

      <div className="mine-vakter-button-group">
        <Link to="/dashboard/butikksjef/createshift">
          <button className="mine-vakter-create-button">➕ Opprett ny vakt</button>
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
          {activeTab === "mine" ? "Dine opprettede vakter:" : "Alle vakter i butikken:"}
        </h3>
        {shifts.length === 0 ? (
          <p className="mine-vakter-empty-message">Ingen vakter funnet.</p>
        ) : (
          shifts.map((shift) => (
            <div key={shift.shift_id} className="mine-vakter-shift-card">
              <h4 className="mine-vakter-shift-title">{shift.title}</h4>
              <p className="mine-vakter-shift-description">{shift.description}</p>
              <p className="mine-vakter-shift-time">
                {shift.date} | {shift.start_time} - {shift.end_time}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MineVakter;
