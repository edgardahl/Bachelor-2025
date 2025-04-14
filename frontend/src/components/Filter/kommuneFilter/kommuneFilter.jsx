import React, { useEffect, useState } from "react";
import Select from "react-select";
import axios from "../../../api/axiosInstance";
import "./kommuneFilter.css";

const KommuneFilter = ({ onChange, defaultValue = [], userPreferredMunicipalities = [] }) => {
  const [municipalities, setMunicipalities] = useState([]);
  const [selectedMunicipalities, setSelectedMunicipalities] = useState(defaultValue);

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

  const handleChange = (selectedOptions) => {
    setSelectedMunicipalities(selectedOptions);
    onChange(selectedOptions.map((opt) => opt.value));
  };

  const handleReset = () => {
    // Reset to preferred municipalities
    const defaultSelected = municipalities.filter(m => 
      userPreferredMunicipalities.includes(m.municipality_name)
    ).map(m => ({
      label: m.store_count ? `${m.municipality_name} (${m.store_count} butikker)` : m.municipality_name,
      value: m.municipality_name
    }));

    setSelectedMunicipalities(defaultSelected);
    onChange(defaultSelected.map((opt) => opt.value));
  };

  const options = municipalities.map((m) => ({
    label: m.store_count
      ? `${m.municipality_name} (${m.store_count} butikker)`
      : m.municipality_name,
    value: m.municipality_name,
  }));

  return (
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
            borderColor: state.isFocused ? '#4CAF50' : '#ddd',
            backgroundColor: '#fff',
            borderRadius: 0,  // Removed border-radius
            minHeight: 50,
            fontSize: '1rem',
            boxShadow: state.isFocused ? '0 0 5px rgba(76, 175, 80, 0.5)' : 'none',
            transition: 'all 0.2s ease',
            padding: '0 12px',
            width: '100%',
            border: '1px solid #ddd', // Adding border instead of border-radius
          }),
          menu: (baseStyles) => ({
            ...baseStyles,
            maxHeight: 250,
            overflowY: 'auto',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',            
            marginTop: '5px',
          }),
          option: (baseStyles, state) => ({
            ...baseStyles,
            backgroundColor: state.isSelected ? '#4CAF50' : state.isFocused ? '#e8f5e9' : 'transparent',
            color: state.isSelected ? '#fff' : '#333',
            padding: '12px 16px',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
            border: 'none', // Remove borders from options
          }),
          placeholder: (baseStyles) => ({
            ...baseStyles,
            color: '#aaa',
          }),
        }}
      />
      
      <button 
        className="reset-preferred-button" 
        onClick={handleReset}
      >
        Tilbakestill til foretrukne kommuner
      </button>
    </div>
  );
};

export default KommuneFilter;
