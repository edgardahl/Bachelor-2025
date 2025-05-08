import React from "react";
import { Link } from "react-router-dom";
import "./ButikkCard.css";
import useAuth from "../../../context/UseAuth";

const storeChainImages = {
  "Coop Prix": "CoopPrix.png",
  Prix: "CoopPrix.png",
  "Coop Marked": "CoopMarked.png",
  Marked: "CoopMarked.png",
  "Coop Extra": "Extra.png",
  Extra: "Extra.png",
  "Coop Obs": "Obs.png",
  Obs: "Obs.png",
  "Coop Mega": "CoopMega.png",
  Mega: "CoopMega.png",
  "Obs BYGG": "ObsBygg.png",
  Bygg: "ObsBygg.png",
  default: "Default.png",
};

const ButikkCard = ({ store, shiftsCount }) => {
  const { user } = useAuth();
  const role = user?.role === "employee" ? "ba" : "bs";

  const imageSrc =
    storeChainImages[store.store_chain] || storeChainImages["default"];

  const [street, city] = store.address.split(",").map((part) => part.trim());

  const cardContent = (
    <div className="butikk-card">
      <div>
        <div className="butikk-card-header">
          <div className="image-container">
            <img src={`/icons/${imageSrc}`} alt={store.store_chain} />
          </div>
          <h2>
            {store.store_chain} {store.name}
          </h2>
        </div>

        <div className="butikk-card-info">
          <div className="butikk-general-info">
            <p className="butikk-address">{street}</p>
            <p className="butikk-address">{city}</p>
            <span className="butikk-chip">
              {shiftsCount} publiserte vakter
            </span>
          </div>
        </div>
      </div>

      <p className="butikk-more-info">
        {user?.role ? "Mer info →" : "Logg inn for mer info"}
      </p>
    </div>
  );

  return user?.role ? (
    <Link
      to={`/${role}/butikker/${store.store_chain}/${store.name}/${store.store_id}`}
      className="butikk-card-link"
    >
      {cardContent}
    </Link>
  ) : (
    <div className="butikk-card-link disabled">{cardContent}</div>
  );
};

export default ButikkCard;
