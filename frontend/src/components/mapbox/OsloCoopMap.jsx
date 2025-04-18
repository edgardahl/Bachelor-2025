import React, { useEffect, useState, useRef, use } from "react";
import axios from "../../api/axiosInstance";
import useAuth from "../../context/UseAuth";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import redStoreIconUrl from "../../../public/icons/red_store.png";
import { useNavigate } from "react-router-dom";

// Custom icon for stores
const redStoreIcon = new L.Icon({
  iconUrl: redStoreIconUrl,
  iconSize: [40, 40],
  iconAnchor: [15, 40],
  popupAnchor: [0, -40],
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
  shadowAnchor: [12, 41],
});


// Component to go to user's location
const GoToMyLocation = ({ setUserPosition }) => {
  const map = useMap();

  const handleClick = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserPosition([latitude, longitude]);
        map.flyTo([latitude, longitude], 13, { animate: true });
      },
      () => alert("Kunne ikke hente posisjon.")
    );
  };

  return (
    <button
      onClick={handleClick}
      style={{
        position: "absolute",
        top: 10,
        right: 10,
        zIndex: 1000,
        background: "#fff",
        border: "1px solid #ccc",
        padding: "8px 12px",
        borderRadius: "6px",
        cursor: "pointer",
      }}
    >
      📍 Min posisjon
    </button>
  );
};

// Component to search and fly to location
const LocationSearch = () => {
  const map = useMap();
  const inputRef = useRef();

  const handleSearch = async () => {
    const query = inputRef.current.value;
    if (!query) return;

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}`
    );
    const data = await response.json();
    if (data && data.length > 0) {
      const { lat, lon } = data[0];
      map.flyTo([parseFloat(lat), parseFloat(lon)], 13, { animate: true });
    } else {
      alert("Fant ikke stedet 😢");
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        left: 10,
        zIndex: 1000,
        background: "#fff",
        padding: "6px",
        borderRadius: "8px",
        display: "flex",
        gap: "6px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
      }}
    >
      <input
        ref={inputRef}
        type="text"
        placeholder="Søk etter sted..."
        style={{
          padding: "6px 8px",
          borderRadius: "6px",
          border: "1px solid #ccc",
          width: "200px",
        }}
      />
      <button
        onClick={handleSearch}
        style={{
          padding: "6px 10px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Søk
      </button>
    </div>
  );
};

const CoopMap = () => {
  const [userPosition, setUserPosition] = useState(null);
  const [stores, setStores] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Attempt to get the user's position on load
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserPosition([latitude, longitude]);
      },
      () => {
        // In case of failure, fallback to Oslo
        setUserPosition([59.9139, 10.7522]);
      }
    );

    // Fetch stores from the API
    const fetchStores = async () => {
      try {
        const response = await axios.get("/stores/getAllStoresWithInfo");
        console.log(response.data);
        const formattedStores = response.data
          .filter(store => store.latitude && store.longitude)
          .map((store) => ({
            ...store,
            position: [store.latitude, store.longitude],
          }));
        setStores(formattedStores);
      } catch (error) {
        console.error("Error fetching stores:", error);
      }
    };

    fetchStores();
  }, []);

  return (
    <div style={{ position: "relative", height: "500px", marginTop: "2rem" }}>

      <MapContainer
        center={userPosition || [59.9139, 10.7522]}  // If userPosition is not available, fallback to Oslo
        zoom={12}
        style={{ height: "100%", width: "100%", borderRadius: "12px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        
        <LocationSearch />
        <GoToMyLocation setUserPosition={setUserPosition} />

        {stores.map((store, idx) => (
          <Marker key={idx} position={store.position} icon={redStoreIcon}>
            <Popup>
              <strong>{store.store_chain} {store.name}</strong>
              <br />
              {user?.role === "store_manager" && (
                <>
                  Fleksible ansatte: {store.flexible_employees}
                  <br />
                  Ledige vakter: {store.open_shifts}
                  <br />
                </>
              )}
              {user?.role === "employee" && (
                <>
                  Ledige vakter: {store.open_shifts}
                  <br />
                </>
              )}
              <button
                onClick={() => navigate(`/${user?.role === "store_manager" ? "bs" : "ba"}/butikker/${store.store_chain}/${store.name}/${store.store_id}`)}
                style={{
                  marginTop: "8px",
                  backgroundColor: "#ff5050",
                  border: "none",
                  color: "white",
                  padding: "5px 10px",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Gå til butikk
              </button>
            </Popup>

            <Tooltip direction="top" offset={[0, -30]} opacity={1} permanent>
              {store.store_chain} {store.name}
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};


export default CoopMap;
