import React from "react";
import { Link } from "react-router-dom";
import "./ButikkCard.css";

const ButikkCard = ({ store, shiftsCount }) => {
  return (
    <Link
      to={`/dashboard/butikksjef/${store.store_chain}/${store.name}/${store.store_id}`}
      className="butikk-card-link"
    >
      <div className="butikk-card">
        <h2>{store.name}</h2>
        <p>{store.email}</p>
        <p>{store.phone_number}</p>
        <p>{store.store_chain}</p>
        <p>{store.address}</p>
        <p>Trenger ansatte: {shiftsCount}</p>
      </div>
    </Link>
  );
};

export default ButikkCard;
