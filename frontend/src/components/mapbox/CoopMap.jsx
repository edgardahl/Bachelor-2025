import React, { useEffect, useState, useRef } from "react";
import axios from "../../api/axiosInstance";
import useAuth from "../../context/UseAuth";
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./CoopMap.css";
import redStoreIconUrl from "../../../public/icons/red_store.png";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

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
      () => toast.error("Kunne ikke hente posisjon.")
    );
  };

  return (
    <button className="my-location-button" onClick={handleClick}>
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
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
    );
    const data = await response.json();
    if (data && data.length > 0) {
      const { lat, lon } = data[0];
      map.flyTo([parseFloat(lat), parseFloat(lon)], 13, { animate: true });
    } else {
      toast.error("Ugyldig sted. Vennligst prøv igjen.");
    }
  };

  return (
    <div className="location-search">
      <input
        ref={inputRef}
        type="text"
        placeholder="Søk etter sted..."
        className="search-input"
      />
      <button onClick={handleSearch} className="search-button">
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
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserPosition([latitude, longitude]);
      },
      () => {
        setUserPosition([59.9139, 10.7522]); // fallback Oslo
      }
    );

    const fetchStores = async () => {
      try {
        const response = await axios.get("/stores/getAllStoresWithInfo");
        const formattedStores = response.data
          .filter((store) => store.latitude && store.longitude)
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
    <div className="coop-map-wrapper">
      <MapContainer
        center={userPosition || [59.9139, 10.7522]}
        zoom={12}
        className="map-container"
      >
        <MapControlZoom />
        <TileLayer
          attribution="&copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a>"
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <LocationSearch />
        <GoToMyLocation setUserPosition={setUserPosition} />

        {stores.map((store, idx) => (
          <Marker key={idx} position={store.position} icon={redStoreIcon}>
            <Popup>
              <strong>
                {store.store_chain} {store.name}
              </strong>
              {user?.role === "store_manager" && (
                <>Tilgjengelige ansatte: {store.flexible_employees}</>
              )}
              {user?.role === "employee" && (
                <>Ledige vakter: {store.open_shifts}</>
              )}
              <br />
              <button
                className="store-button"
                onClick={() =>
                  navigate(
                    `/${
                      user?.role === "store_manager" ? "bs" : "ba"
                    }/butikker/${store.store_chain}/${store.name}/${store.store_id}`
                  )
                }
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

// Custom zoom control component with conditional zoom behavior
const MapControlZoom = () => {
  const map = useMap();

  useEffect(() => {
    const handleWheel = (e) => {
      if (!e.ctrlKey) {
        e.preventDefault();
      }
    };

    map.getContainer().addEventListener("wheel", handleWheel);

    return () => {
      map.getContainer().removeEventListener("wheel", handleWheel);
    };
  }, [map]);

  return null;
};

export default CoopMap;
