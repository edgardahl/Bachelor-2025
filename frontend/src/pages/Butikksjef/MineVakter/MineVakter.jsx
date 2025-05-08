import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../../api/axiosInstance";
import ShiftCard from "../../../components/Cards/ShiftCard/ShiftCard";
import Loading from "../../../components/Loading/Loading";
import "./MineVakter.css";
import { HiPlusSm } from "react-icons/hi";

import useAuth from "../../../context/UseAuth";

const MineVakter = () => {
  const { user } = useAuth();
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [storeId, setStoreId] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [activeTab, setActiveTab] = useState("mine");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndShifts = async () => {
      try {
        const id = user.id;
        const storeId = user.storeId;
        const userRole = user.role;
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
      console.log("Fetched shifts:", response.data);
    } catch (error) {
      console.error("Error fetching shifts:", error);
    } finally {
      setLoading(false);
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

  return (
    <div className="mine-vakter-container">
      <h1 className="mine-vakter-title">DINE UTLYSTE VAKTER</h1>
      <div className="mine-vakter-beskrivelse">
        <p>
          Her kan du se alle vaktene du har lagt ut, legge ut nye, sjekke hvilke
          som er tatt og se vaktene andre i butikken din har delt.
        </p>
      </div>

      <div className="mine-vakter-tab-bar">
        <Link to="/bs/vakter/lag-vakt" className="mine-vakter-create-link">
          <div className="mine-vakter-create-button-wrapper">
            <div className="mine-vakter-create-round-button">
              <HiPlusSm size={26} />
            </div>
            <span className="mine-vakter-create-text">Legg ut vakt</span>
          </div>
        </Link>

        <div className="mine-vakter-tab-boxes">
          <button
            className={`mine-vakter-tab-box ${
              activeTab === "mine" ? "active" : ""
            }`}
            onClick={() => handleTabChange("mine")}
          >
            Mine vakter
          </button>
          <button
            className={`mine-vakter-tab-box ${
              activeTab === "store" ? "active" : ""
            }`}
            onClick={() => handleTabChange("store")}
          >
            Alle i butikken
          </button>
        </div>
      </div>
      <h3 className="mine-vakter-shift-list-title">
        {activeTab === "mine"
          ? "Mine opprettede vakter:"
          : "Alle vakter i butikken:"}
      </h3>
      {loading ? (
        <Loading />
      ) : (
        <>
          {shifts.length === 0 ? (
            <p className="mine-vakter-empty-message">Du har ikke publisert noen vakter enda</p>
          ) : (
            Object.entries(
              shifts.reduce((acc, shift) => {
                const dateKey = new Date(shift.date).toLocaleDateString(
                  "no-NO",
                  {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  }
                );
                if (!acc[dateKey]) acc[dateKey] = [];
                acc[dateKey].push(shift);
                return acc;
              }, {})
            ).flatMap(([date, shiftGroup]) => [
              <div
                key={`heading-${date}`}
                className="shift-date-heading-wrapper"
              >
                <h4 className="shift-date-heading">{date}</h4>
              </div>,
              <div key={`shifts-${date}`} className="mine-vakter-shift-list">
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
                    userRole={userRole}
                    usersstoreId={storeId}
                    shiftStoreId={shift.store_id}
                    claimedByName={
                      shift.claimed_by_first_name && shift.claimed_by_last_name
                        ? `${shift.claimed_by_first_name} ${shift.claimed_by_last_name}`
                        : ""
                    }
                    claimedById={shift.claimed_by_id}
                    deleteShift={deleteShift}
                  />
                ))}
              </div>,
            ])
          )}
        </>
      )}
    </div>
  );
};

export default MineVakter;
