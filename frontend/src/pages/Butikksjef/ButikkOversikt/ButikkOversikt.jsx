import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../../../api/axiosInstance";
import ButikkCard from "../../../components/Cards/ButikkCard";
import "./ButikkOversikt.css";

const ButikkOversikt = () => {
  const [stores, setStores] = useState([]);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await axios.get("/stores");
        setStores(response.data);
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
          <ButikkCard key={store.id} store={store} />
        ))}
      </div>
      <Link to="/dashboard/butikksjef">Tilbake til Dashboard</Link>
    </div>
  );
};

export default ButikkOversikt;
