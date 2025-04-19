import React from "react";
import "./ButikkKjedeFilter.css";

const storeChains = [
    "Coop Mega",
    "Coop Prix",
    "Coop Marked",
    "Extra",
    "Obs",
    "Obs BYGG",
    "Coop Byggmix",
    "Prix",
    "Mega"
  ];
  

const StoreChainFilter = ({ selectedChains, onChange }) => {
  const handleCheckboxChange = (chain) => {
    const updatedChains = selectedChains.includes(chain)
      ? selectedChains.filter((c) => c !== chain)
      : [...selectedChains, chain];

    onChange(updatedChains);
  };

  return (
    <div className="storechain-filter-container">
    <div className="storechain-filter">
      <h4>Filtrer på butikkjede</h4>
      {storeChains.map((chain) => {
        const isChecked = selectedChains.includes(chain);

        return (
            <div
            key={chain}
            className={`storechain-option storechain-${chain.replace(/\s+/g, '-').toLowerCase()} ${isChecked ? "checked" : ""}`}
            onClick={() => handleCheckboxChange(chain)}
          >
            {chain}
          </div>
          
        );
      })}
    </div>
    </div>
  );
};

export default StoreChainFilter;
