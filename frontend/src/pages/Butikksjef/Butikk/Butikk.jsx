import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../../../api/axiosInstance";
import ShiftCard from "../../../components/shiftCard/shiftCard"; // Import ShiftCard
import "./Butikk.css";

const Butikk = () => {
  const { store_id } = useParams();
  const [store, setStore] = useState(null);
  const [shifts, setShifts] = useState([]); // State to store shifts

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
        setShifts(response.data); // Assuming the API returns an array of shifts
      } catch (error) {
        console.error("Error fetching shifts:", error);
      }
    };

    fetchStoreDetails();
    fetchShifts();
  }, [store_id]);

  if (!store) return <p>Loading...</p>;

  return (
    <div className="butikk-page">
      <h1 className="butikk-title">{store.name}</h1>
      <p className="butikk-email">{store.email}</p>
      <p className="butikk-phone">{store.phone_number}</p>
      <p className="butikk-chain">{store.store_chain}</p>
      <p className="butikk-address">{store.address}</p>

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
            />
          ))
        ) : (
          <p className="butikk-no-shifts">Ingen vakter publisert for denne butikken.</p>
        )}
      </div>
    </div>
  );
};

export default Butikk;
