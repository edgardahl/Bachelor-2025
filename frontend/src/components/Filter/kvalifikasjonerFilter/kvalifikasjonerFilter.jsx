import React, { useEffect, useState } from "react";
import Select from "react-select";
import axios from "../../../api/axiosInstance";
import "./kvalifikasjonerFilter.css";

const KvalifikasjonerFilter = ({ onChange, defaultValue = [] }) => {
  const [qualifications, setQualifications] = useState([]);
  const [selectedQualifications, setSelectedQualifications] =
    useState(defaultValue);

  useEffect(() => {
    const fetchQualifications = async () => {
      try {
        const response = await axios.get("/qualifications");
        setQualifications(response.data);
      } catch (error) {
        console.error("Error fetching qualifications:", error);
      }
    };

    fetchQualifications();
  }, []);

  const handleChange = (selectedOptions) => {
    setSelectedQualifications(selectedOptions);
    onChange(selectedOptions.map((opt) => opt.value));
  };

  const handleReset = () => {
    setSelectedQualifications([]);
    onChange([]); // Notify parent
  };

  const options = qualifications.map((q) => ({
    label: q.name,
    value: q.name,
  }));

  return (
    <div className="kompetanse-filter-container">
      <div className="kommune-filter">
        <label htmlFor="qualification-select" className="kommune-filter__label">
          Filtrer på kvalifikasjoner
        </label>
        <Select
          id="qualification-select"
          options={options}
          value={selectedQualifications}
          onChange={handleChange}
          isMulti
          isSearchable
          placeholder="Velg kvalifikasjoner"
          closeMenuOnSelect={false}
          hideSelectedOptions={false}
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
              display: "flex",
              alignItems: "center",
            }),
            placeholder: (baseStyles) => ({
              ...baseStyles,
              color: "#aaa",
            }),
          }}
          components={{
            Option: ({ data, innerRef, innerProps, isSelected }) => (
              <div
                ref={innerRef}
                {...innerProps}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "8px 12px",
                }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}}
                  style={{ marginRight: 10 }}
                />
                {data.label}
              </div>
            ),
          }}
        />

        <button
          className={`reset-preferred-button ${
            selectedQualifications.length === 0 ? "hidden" : ""
          }`}
          onClick={handleReset}
        >
          Tilbakestill filter
        </button>
      </div>
    </div>
  );
};

export default KvalifikasjonerFilter;
