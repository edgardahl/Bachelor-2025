import React from "react";
import "./ButikkCard.css";

const ButikkCard = ({ store, shiftsCount }) => {
  return (
    <div className="butikk-card">
      <h2>{store.name}</h2>
      <p>{store.email}</p>
      <p>{store.phone_number}</p>
      <p>{store.store_chain}</p>
      <p>{store.address}</p>
      <p>Trenger ansatte: {shiftsCount}</p>
    </div>
  );
};

export default ButikkCard;
