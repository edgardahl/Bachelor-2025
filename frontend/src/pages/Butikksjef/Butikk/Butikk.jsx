import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../../../api/axiosInstance";
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
      <h1>{store.name}</h1>
      <p>{store.email}</p>
      <p>{store.phone_number}</p>
      <p>{store.store_chain}</p>
      <p>{store.address}</p>

      <h2>Publiserte Vakter</h2>
      <div className="shifts-list">
        {shifts.length > 0 ? (
          shifts.map((shift) => (
            <div key={shift.shift_id} className="shift-card">
              <p>
                <strong>Dato:</strong> {shift.date}
              </p>
              <p>
                <strong>Starttid:</strong> {shift.start_time}
              </p>
              <p>
                <strong>Sluttid:</strong> {shift.end_time}
              </p>
            </div>
          ))
        ) : (
          <p>Ingen vakter publisert for denne butikken.</p>
        )}
      </div>
    </div>
  );
};

export default Butikk;
