import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../../../api/axiosInstance";
import ButikkCard from "../../../components/Cards/ButikkCard";
import "./ButikkOversikt.css";

const ButikkOversikt = () => {
  const [stores, setStores] = useState([]);
  const [shiftsCount, setShiftsCount] = useState({}); // Store shifts count for each store

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await axios.get("/stores");
        setStores(response.data);

        // Fetch shifts count for each store
        const shiftsData = {};
        for (const store of response.data) {
          try {
            const shiftsResponse = await axios.get(
              `/shifts/store/${store.store_id}`
            );
            shiftsData[store.store_id] = shiftsResponse.data.length;
          } catch (error) {
            console.error(
              `Error fetching shifts for store ${store.id}:`,
              error
            );
            shiftsData[store.store_id] = 0;
          }
        }
        setShiftsCount(shiftsData);
      } catch (error) {
        console.error("Error fetching stores:", error);
      }
    };

    fetchStores();
  }, []);

  return (
    <div className="dine-vakter">
      <h1>Butikker</h1>
      <p>Her kan du se alle butikker.</p>
      <div className="butikk-liste">
        {stores.map((store) => (
          <ButikkCard
            key={store.store_id}
            store={store}
            shiftsCount={shiftsCount[store.store_id] || 0}
          />
        ))}
      </div>
      <Link to="/dashboard/butikksjef">Tilbake til Dashboard</Link>
    </div>
  );
};

export default ButikkOversikt;
