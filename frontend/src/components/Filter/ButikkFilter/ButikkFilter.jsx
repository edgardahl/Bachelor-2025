import React, { useState, useEffect } from "react";
import axios from "../../../api/axiosInstance";
import "./ButikkFilter.css";

const ButikkFilter = ({ onFilter }) => {
  const [counties, setCounties] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [selectedCounty, setSelectedCounty] = useState("");
  const [selectedMunicipality, setSelectedMunicipality] = useState("");

  // Fetch counties and municipalities
  useEffect(() => {
    const fetchCountiesAndMunicipalities = async () => {
      try {
        const response = await axios.get("/stores/stores-with-municipality");

        const uniqueCounties = new Set();
        const municipalitiesByCounty = {};

        // Check if response.data contains a "stores" property
        const stores = response.data.stores || response.data; // Adjust based on API response

        stores.forEach((store) => {
          if (!store.municipality) return; // ✅ Skip stores without municipality

          const { county_name, municipality_name } = store.municipality;

          if (county_name) uniqueCounties.add(county_name);

          if (county_name && municipality_name) {
            if (!municipalitiesByCounty[county_name]) {
              municipalitiesByCounty[county_name] = new Set();
            }
            municipalitiesByCounty[county_name].add(municipality_name);
          }
        });

        setCounties([...uniqueCounties]);
        setMunicipalities(municipalitiesByCounty);
      } catch (error) {
        console.error("Error fetching counties and municipalities:", error);
      }
    };

    fetchCountiesAndMunicipalities();
  }, []);

  // Handle county selection
  const handleCountyChange = (e) => {
    const county = e.target.value;
    setSelectedCounty(county);
    setSelectedMunicipality(""); // Reset municipality when county changes
  };

  // Handle filter submission
  const handleFilter = () => {
    onFilter({ county: selectedCounty, municipality: selectedMunicipality });
  };

  return (
    <div className="store-filter">
      <div className="filter-group">
        <label htmlFor="county">Fylke:</label>
        <select
          id="county"
          value={selectedCounty}
          onChange={handleCountyChange}
        >
          <option value="">Velg fylke</option>
          {counties.map((county) => (
            <option key={county} value={county}>
              {county}
            </option>
          ))}
        </select>
      </div>
      <div className="filter-group">
        <label htmlFor="municipality">Kommune:</label>
        <select
          id="municipality"
          value={selectedMunicipality}
          onChange={(e) => setSelectedMunicipality(e.target.value)}
          disabled={!selectedCounty}
        >
          <option value="">Velg kommune</option>
          {selectedCounty &&
            municipalities[selectedCounty] &&
            [...municipalities[selectedCounty]].map((municipality) => (
              <option key={municipality} value={municipality}>
                {municipality}
              </option>
            ))}
        </select>
      </div>
      <button onClick={handleFilter} className="filter-button">
        Filtrer
      </button>
    </div>
  );
};

export default ButikkFilter;
