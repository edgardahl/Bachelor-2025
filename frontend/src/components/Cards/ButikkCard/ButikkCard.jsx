import React from "react";
import { Link } from "react-router-dom";
import "./ButikkCard.css";
import useAuth from "../../../context/UseAuth";

// Define an object to map store chains to their respective image filenames
const storeChainImages = {
  "Coop Prix": "Prix.png",
  "Coop Marked": "Marked.png",
  "Extra": "Extra.png",
  "Obs": "Obs.png",
  "Prix": "Prix.png",
  "Mega": "Mega.png",
  // Default image if no match is found
  "default": "Default.png"
};

const ButikkCard = ({ store, shiftsCount }) => {
  const { user } = useAuth();
  const role = user.role === "employee" ? "ba" : "bs";

  // Get the correct image based on the store_chain, or fallback to the default image
  const imageSrc = storeChainImages[store.store_chain] || storeChainImages["default"];
  console.log(imageSrc);

  return (
    <Link
      to={`/${role}/butikker/${store.store_chain}/${store.name}/${store.store_id}`}
      className="butikk-card-link"
    >
      <div className="butikk-card">
        <div>
          <div className="butikk-card-header">
            <div className="image-container">
              {/* Dynamically load the image based on store_chain */}
              <img
                src={`../../../../public/icons/${imageSrc}`}
                alt={store.store_chain}
              />
            </div>
            <h2>{store.store_chain} {store.name}</h2>
          </div>
          <span className="butikk-chip">{shiftsCount} ledige vakter</span>
          <div className="butikk-general-info">
            <p className="butikk-address">{store.address}</p>
            <div className="butikk-contact">
              <p>{store.email}</p>
              <p>{store.phone_number}</p>
            </div>
          </div>
        </div>

        <p className="butikk-more-info">Mer info →</p>
      </div>
    </Link>
  );
};

export default ButikkCard;
