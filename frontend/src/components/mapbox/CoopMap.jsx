import { useEffect, useState, useRef } from "react";
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
import "./CoopMap.css";
import redStoreIconUrl from "/icons/red_store.png";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// Egendefinert ikon for butikkmarkører
const redStoreIcon = new L.Icon({
  iconUrl: redStoreIconUrl,
  iconSize: [40, 40],
  iconAnchor: [15, 40],
  popupAnchor: [0, -40],
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
  shadowAnchor: [12, 41],
});

// Komponent for å flytte kartet til brukerens nåværende geolokasjon
const GoToMyLocation = ({ setUserPosition }) => {
  const map = useMap();

  const handleClick = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserPosition([latitude, longitude]);
        map.flyTo([latitude, longitude], 13, { animate: true });
      },
      () => toast.error("Kunne ikke hente posisjon.") // Vist feilmelding hvis posisjonen ikke kan hentes
    );
  };

  return (
    <button className="my-location-button" onClick={handleClick}>
      📍 Min posisjon
    </button>
  );
};

// Søkelinje som geokoder input og sentrerer kartet
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
    if (data?.length) {
      const { lat, lon } = data[0];
      map.flyTo([parseFloat(lat), parseFloat(lon)], 13, {
        animate: true,
      });
    } else {
      toast.error("Ugyldig sted. Vennligst prøv igjen."); // Vist feilmelding hvis sted ikke finnes
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

// Hovedkomponent for kartet som henter butikkdata og tegner markører
const CoopMap = () => {
  const [userPosition, setUserPosition] = useState(null);
  const [stores, setStores] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Ved mount: hent brukerens posisjon og butikkdata
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserPosition([latitude, longitude]);
      },
      () => {
        setUserPosition([59.9139, 10.7522]); // Fallback til Oslo hvis posisjon ikke kan hentes
      }
    );

    // Hent butikkdata
    const fetchStores = async () => {
      try {
        const response = await axios.get("/stores/getAllStoresWithInfo");
        const formatted = response.data
          .filter((s) => s.latitude && s.longitude) // Filter for å sikre at butikkene har gyldige koordinater
          .map((s) => ({
            ...s,
            position: [s.latitude, s.longitude],
          }));
        setStores(formatted);
      } catch (error) {
        console.error("Error fetching stores:", error); // Feilhåndtering for å hente butikkdata
      }
    };

    fetchStores();
  }, []);

  return (
    <div className="coop-map-wrapper">
      <MapContainer
        center={userPosition || [59.9139, 10.7522]} // Sett standard senterposisjon til Oslo hvis brukerens posisjon ikke er tilgjengelig
        zoom={12}
        className="map-container"
      >
        {/* Egendefinert zoomkontroll som forhindrer zooming uten Ctrl */}
        <MapControlZoom />

        {/* Kartfliser */}
        <TileLayer
          attribution="&copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a>"
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {/* Søke- og posisjonsknapper */}
        <LocationSearch />
        <GoToMyLocation setUserPosition={setUserPosition} />

        {/* Marker butikkene på kartet */}
        {stores.map((store, idx) => (
          <Marker
            key={idx}
            position={store.position}
            icon={redStoreIcon} // Bruk egendefinert ikon
          >
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
                onClick={() => {
                  const rolePath =
                    user?.role === "admin"
                      ? "admin"
                      : user?.role === "store_manager"
                      ? "bs"
                      : "ba";
                  navigate(
                    `/${rolePath}/butikker/${store.store_chain}/${store.name}/${store.store_id}`
                  );
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

// Forhindrer zoom med musen med mindre Ctrl-tasten holdes inne
const MapControlZoom = () => {
  const map = useMap();

  useEffect(() => {
    const handleWheel = (e) => {
      if (!e.ctrlKey) e.preventDefault(); // Forhindrer zooming med musen uten Ctrl-tasten
    };
    const container = map.getContainer();
    container.addEventListener("wheel", handleWheel); // Lytter på musens hjulbevegelse
    return () => {
      container.removeEventListener("wheel", handleWheel); // Fjerner event listener når komponenten unmountes
    };
  }, [map]);

  return null;
};

export default CoopMap;
