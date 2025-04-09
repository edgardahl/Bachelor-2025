import React, { useEffect, useState } from "react";
import axios from "../../../api/axiosInstance";
import "./MineVakter.css";
import ShiftCard from "../../../components/Cards/ShiftCard/ShiftCard";
import useAuth from "../../../context/UseAuth";

const MineVakterAnsatt = () => {
  const { user } = useAuth(); // Get the user from context
  const [userId, setUserId] = useState(null);
  const [storeId, setStoreId] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [activeTab, setActiveTab] = useState("mine");

  useEffect(() => {
    const fetchUserAndShifts = async () => {
      try {
        const id = user.id;
        const storeId = user.storeId;
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
        response = await axios.get(`/shifts/user_is_qualified_for/${userId}`);
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

  const claimShift = async (shiftId) => {
    try {
      await axios.post(`/shifts/claim/${shiftId}`, {
        user_id: userId,
      });
      alert("Vakt er nå reservert!");
      // Optionally, refetch shifts to update the UI
      fetchShifts(activeTab, userId, storeId);
    } catch (error) {
      console.error("Error claiming shift:", error);
      alert("Kunne ikke reservere vakt.");
    }
  };

  const groupShiftsByDate = (shifts) => {
    const sortedShifts = [...shifts].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    return sortedShifts.reduce((acc, shift) => {
      const dateKey = new Date(shift.date).toLocaleDateString("no-NO", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });

      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(shift);

      return acc;
    }, {});
  };

  const groupedShifts = groupShiftsByDate(shifts);

  return (
    <div className="mine-vakter-container">
      <h1 className="mine-vakter-title">Vakter</h1>

      <div className="mine-vakter-tabs">
        <button
          className={`mine-vakter-tab ${activeTab === "mine" ? "active" : ""}`}
          onClick={() => handleTabChange("mine")}
        >
          Mine kvalifiserte vakter
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
            ? "Vakter du er kvalifisert for:"
            : "Alle vakter i butikken:"}
        </h3>
        {Object.entries(groupedShifts).map(([date, dateShifts]) => (
          <div key={date} className="shift-date-group">
            <h4 className="shift-date-heading">{date}</h4>
            {dateShifts.map((shift) => (
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
                postedById={shift.posted_by_id}
                userId={userId}
                usersstoreId={storeId}
                shiftStoreId={shift.store_id}
                actions={
                  activeTab === "mine" && (
                    <button
                      className="claim-shift-button"
                      onClick={() => claimShift(shift.shift_id)}
                    >
                      Reserver vakt
                    </button>
                  )
                }
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MineVakterAnsatt;
