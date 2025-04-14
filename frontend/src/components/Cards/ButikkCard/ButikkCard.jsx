import React from "react";
import { Link } from "react-router-dom";
import "./ButikkCard.css";
import useAuth from "../../../context/UseAuth";

const ButikkCard = ({ store, shiftsCount }) => {
  const { user } = useAuth();
  const role = user.role === "employee" ? "ba" : "bs";

  return (
    <Link
      to={`/${role}/butikker/${store.store_chain}/${store.name}/${store.store_id}`}
      className="butikk-card-link"
    >
      <div className="butikk-card">
        <div className="butikk-card-header">
          <h2>{store.store_chain} {store.name}</h2>
          <span className="butikk-chip">{shiftsCount} ledige vakter</span>
        </div>
        <p className="butikk-address">📍 {store.address}</p>

        <div className="butikk-contact">
          <p><strong>📧</strong> {store.email}</p>
          <p><strong>📞</strong> {store.phone_number}</p>
        </div>
      </div>
    </Link>
  );
};

export default ButikkCard;
