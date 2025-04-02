import React from "react";
import { Link } from "react-router-dom";
import "./ButikkCard.css";

const ButikkCard = ({ store }) => {
  return (
    <div className="butikk-card">
      <h2>{store.name}</h2>
      <p>{store.email}</p>
      <p>{store.phone_number}</p>
      <p>{`${store.store_chain} ${store.address}`}</p>
    </div>
  );
};

export default ButikkCard;
