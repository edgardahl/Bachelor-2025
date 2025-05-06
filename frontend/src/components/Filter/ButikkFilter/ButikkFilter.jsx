import React, { useState, useEffect } from "react";
import axios from "../../../api/axiosInstance";
import "./ButikkFilter.css";

const ButikkFilter = ({ onFilter }) => {
  const [counties, setCounties] = useState([]);
  const [municipalities, setMunicipalities] = useState({});
  const [selectedCounties, setSelectedCounties] = useState([]);
  const [selectedMunicipalities, setSelectedMunicipalities] = useState([]);
  const [isOpen, setIsOpen] = useState(false); // Toggle filters

  useEffect(() => {
    const fetchCountiesAndMunicipalities = async () => {
      try {
        const response = await axios.get("/stores/stores-with-municipality");
        const uniqueCounties = new Set();
        const municipalitiesByCounty = {};

        (response.data.stores || response.data).forEach((store) => {
          if (!store.municipality) return;

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
        setMunicipalities(
          Object.fromEntries(
            Object.entries(municipalitiesByCounty).map(([key, value]) => [
              key,
              [...value].sort(),
            ])
          )
        );
      } catch (error) {
        console.error("Error fetching counties and municipalities:", error);
      }
    };

    fetchCountiesAndMunicipalities();
  }, []);

  const handleCountyChange = (county) => {
    setSelectedCounties((prev) =>
      prev.includes(county)
        ? prev.filter((c) => c !== county)
        : [...prev, county]
    );
    setSelectedMunicipalities([]); // Reset municipalities when counties change
  };

  const handleMunicipalityChange = (municipality) => {
    setSelectedMunicipalities((prev) =>
      prev.includes(municipality)
        ? prev.filter((m) => m !== municipality)
        : [...prev, municipality]
    );
  };

  const handleFilter = () => {
    onFilter({
      county: selectedCounties.join(","), // Pass as a comma-separated string
      municipality: selectedMunicipalities.join(","),
    });
  };

  const resetFilters = () => {
    setSelectedCounties([]);
    setSelectedMunicipalities([]);
  };

  return (
    <div className="store-filter">
      <div className="filter-buttons">
        <button className="toggle-button" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? "Skjul filter" : "Vis filter"}
        </button>
        <div className="button-group">
          <button onClick={handleFilter} className="filter-button">
            Filtrer
          </button>
          <button onClick={resetFilters} className="reset-button">
            Nullstill
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="filter-group">
          <label>Fylker og kommuner:</label>
          <div className="dropdown">
            {counties.map((county) => (
              <div
                key={county}
                className={`county-group ${
                  selectedCounties.includes(county) ? "selected" : ""
                }`}
                onClick={() => handleCountyChange(county)} // Make the entire div clickable
              >
                <div className="county">
                  <input
                    type="checkbox"
                    id={`county-${county}`}
                    value={county}
                    checked={selectedCounties.includes(county)}
                    onChange={() => {}} // Prevent default checkbox behavior
                  />
                  <label htmlFor={`county-${county}`}>{county}</label>
                </div>

                {selectedCounties.includes(county) && (
                  <div className="municipalities">
                    {municipalities[county]?.map((municipality) => (
                      <div
                        key={municipality}
                        className={`municipality ${
                          selectedMunicipalities.includes(municipality)
                            ? "selected"
                            : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent parent click event
                          handleMunicipalityChange(municipality);
                        }}
                      >
                        <input
                          type="checkbox"
                          id={`municipality-${municipality}`}
                          value={municipality}
                          checked={selectedMunicipalities.includes(
                            municipality
                          )}
                          onChange={() => {}} // Prevent default checkbox behavior
                        />
                        <label htmlFor={`municipality-${municipality}`}>
                          {municipality}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ButikkFilter;
