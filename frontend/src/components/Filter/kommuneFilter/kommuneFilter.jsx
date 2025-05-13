import React, { useEffect, useState } from "react";
import Select from "react-select";
import axios from "../../../api/axiosInstance";
import "./kommuneFilter.css";

// Komponent for å filtrere på kommuner
const KommuneFilter = ({
  onChange, 
  defaultValue = [], 
  userPreferredMunicipalities = [], 
  userRole = "", 
}) => {
  const [municipalities, setMunicipalities] = useState([]);
  const [selectedMunicipalities, setSelectedMunicipalities] = useState(defaultValue);
  const [defaultSelected, setDefaultSelected] = useState([]);

  // useEffect for å hente kommunedata fra API ved første rendering
  useEffect(() => {
    const fetchMunicipalities = async () => {
      try {
        const response = await axios.get("/municipalities");
        setMunicipalities(response.data); 
      } catch (error) {
        console.error("Error fetching municipalities:", error);
      }
    };

    fetchMunicipalities();
  }, []);

  // useEffect for å sette forhåndsvalgte kommuner basert på brukerens preferanser
  useEffect(() => {
    if (municipalities.length > 0 && userPreferredMunicipalities.length > 0) {
      // Filtrerer kommuner som matcher brukerens preferanser
      const preferred = municipalities
        .filter(
          (m) =>
            m.municipality_name &&
            userPreferredMunicipalities.includes(m.municipality_name)
        )
        .map((m) => ({
          label: m.store_count
            ? `${m.municipality_name} (${m.store_count} butikker)`
            : m.municipality_name,
          value: m.municipality_name,
        }));

      setSelectedMunicipalities(preferred); 
      setDefaultSelected(preferred); 
      onChange(preferred.map((opt) => opt.value)); 
    }
  }, [municipalities, userPreferredMunicipalities]);

  // Håndterer endringer i valgte kommuner
  const handleChange = (selectedOptions) => {
    setSelectedMunicipalities(selectedOptions || []); 
    onChange((selectedOptions || []).map((opt) => opt.value)); 
  };

  // Tilbakestiller valgte kommuner til standardvalgte
  const handleReset = () => {
    setSelectedMunicipalities(defaultSelected);
    onChange(defaultSelected.map((opt) => opt.value)); // Caller onChange med standardverdier
  };

  // Mapper kommunedata til formatet som kreves av react-select
  const options = municipalities
    .filter((m) => m.municipality_name)
    .map((m) => ({
      label: m.store_count
        ? `${m.municipality_name} (${m.store_count} butikker)`
        : m.municipality_name,
      value: m.municipality_name,
    }));

  // Sjekker om det er gjort endringer fra standardvalgte kommuner
  const hasChanges =
    selectedMunicipalities.length !== defaultSelected.length ||
    selectedMunicipalities.some(
      (sel) => !defaultSelected.find((def) => def.value === sel.value)
    );

  return (
    <div className="kommune-filter-container">
      <div className="kommune-filter">
        <label htmlFor="municipality-select" className="kommune-filter__label">
          Filtrer på kommune
        </label>
        <Select
          id="municipality-select"
          options={options} 
          value={selectedMunicipalities} 
          onChange={handleChange} 
          isMulti 
          isSearchable 
          placeholder="Velg kommune(r)" 
          styles={{
            
            control: (baseStyles, state) => ({
              ...baseStyles,
              borderColor: state.isFocused ? "#4CAF50" : "#ddd",
              backgroundColor: "#fff",
              borderRadius: 0,
              minHeight: 50,
              fontSize: "1rem",
              boxShadow: state.isFocused
                ? "0 0 5px rgba(76, 175, 80, 0.5)"
                : "none",
              transition: "all 0.2s ease",
              padding: "0 12px",
              width: "100%",
              border: "1px solid #ddd",
            }),
            menu: (baseStyles) => ({
              ...baseStyles,
              maxHeight: 250,
              overflowY: "auto",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
              marginTop: "5px",
            }),
            option: (baseStyles, state) => ({
              ...baseStyles,
              backgroundColor: state.isSelected
                ? "#4CAF50"
                : state.isFocused
                ? "#e8f5e9"
                : "transparent",
              color: state.isSelected ? "#fff" : "#333",
              padding: "12px 16px",
              cursor: "pointer",
              transition: "background-color 0.2s ease",
              border: "none",
            }),
            placeholder: (baseStyles) => ({
              ...baseStyles,
              color: "#aaa",
            }),
          }}
        />

        {/* Viser tilbakestillingsknapp kun for ansatte og hvis det er gjort endringer */}
        {userRole === "employee" && (
          <button
            className={`reset-preferred-button ${!hasChanges ? "hidden" : ""}`}
            onClick={handleReset}
          >
            Tilbakestill til foretrukne kommuner
          </button>
        )}
      </div>
    </div>
  );
};

export default KommuneFilter;
