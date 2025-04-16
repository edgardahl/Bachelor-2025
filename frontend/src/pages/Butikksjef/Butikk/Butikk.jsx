import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../../../api/axiosInstance";
import ShiftCard from "../../../components/Cards/ShiftCard/ShiftCard";
import "./Butikk.css";
import useAuth from "../../../context/UseAuth";
import { useNavigate } from "react-router-dom";

const Butikk = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { store_id } = useParams();
  const [store, setStore] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [storeId, setStoreId] = useState(null);

  useEffect(() => {
    const fetchStoreDetails = async () => {
      try {
        const response = await axios.get(`/stores/${store_id}`);
        setStore(response.data);
      } catch (error) {
        console.error("Error fetching store details:", error);
      }
    };

    const fetchShifts = async () => {
      try {
        const response = await axios.get(`/shifts/store/${store_id}`);
        setShifts(response.data);
      } catch (error) {
        console.error("Error fetching shifts:", error);
      }
    };

    const fetchUserAndShifts = async () => {
      try {
        setUserId(user.id);
        setUserRole(user.role);
        setStoreId(user.storeId);
        fetchShifts();
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchStoreDetails();
    fetchShifts();
    fetchUserAndShifts();
  }, [store_id]);

  const deleteShift = (shiftId) => {
    setShifts((prev) => prev.filter((shift) => shift.shift_id !== shiftId));
  };

  if (!store) return <p className="butikk-loading">Laster butikkdata...</p>;

  return (
    <div className="butikk-page">
      <button className="tilbake-button" onClick={() => navigate(-1)}>
        ← Tilbake
      </button>
      <div className="butikk-header">
        <h1 className="butikk-title">
          {store.store_chain} {store.name}
        </h1>
        <div className="butikk-info">
          <p>
            📧 <a href={`mailto:${store.email}`}>{store.email}</a>
          </p>
          <p>
            📞 <a href={`tel:${store.phone_number}`}>{store.phone_number}</a>
          </p>
          <p>📍 {store.address}</p>
        </div>
      </div>

      <h2 className="butikk-shift-heading">Publiserte Vakter</h2>
      <div className="butikk-shift-list">
        {shifts.length > 0 ? (
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
          ))
        ) : (
          <p className="butikk-no-shifts">
            Ingen vakter publisert for denne butikken.
          </p>
        )}
      </div>
    </div>
  );
};

export default Butikk;
