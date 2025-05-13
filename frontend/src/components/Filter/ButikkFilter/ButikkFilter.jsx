import React, { useState, useEffect } from "react";
import axios from "../../../api/axiosInstance";
import "./ButikkFilter.css";

const ButikkFilter = ({ onFilter }) => {
  const [counties, setCounties] = useState([]);
  const [municipalities, setMunicipalities] = useState({});
  const [selectedCounties, setSelectedCounties] = useState([]);
  const [selectedMunicipalities, setSelectedMunicipalities] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Henter alle fylker og tilhørende kommuner når komponenten laster
  useEffect(() => {
    const fetchCountiesAndMunicipalities = async () => {
      try {
        const response = await axios.get("/stores/storesWithMunicipality");
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

  // Håndterer valg av fylke (toggle)
  const handleCountyChange = (county) => {
    setSelectedCounties((prev) =>
      prev.includes(county)
        ? prev.filter((c) => c !== county)
        : [...prev, county]
    );
    setSelectedMunicipalities([]); // Nullstiller kommuner når fylke endres
  };

  // Håndterer valg av kommune (toggle)
  const handleMunicipalityChange = (municipality) => {
    setSelectedMunicipalities((prev) =>
      prev.includes(municipality)
        ? prev.filter((m) => m !== municipality)
        : [...prev, municipality]
    );
  };

  // Sender valgte filtre til foreldren
  const handleFilter = () => {
    onFilter({
      county: selectedCounties.join(","), // Kommaseparert string
      municipality: selectedMunicipalities.join(","),
    });
  };

  // Nullstiller alle valgte filtre
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
                onClick={() => handleCountyChange(county)}
              >
                <div className="county">
                  <input
                    type="checkbox"
                    id={`county-${county}`}
                    value={county}
                    checked={selectedCounties.includes(county)}
                    onChange={() => {}} // Forhindrer dobbel onChange ved div-click
                  />
                  <label htmlFor={`county-${county}`}>{county}</label>
                </div>

                {/* Viser tilhørende kommuner dersom fylket er valgt */}
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
                          e.stopPropagation(); // Hindrer at county click trigges
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
                          onChange={() => {}} // Samme som over
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
