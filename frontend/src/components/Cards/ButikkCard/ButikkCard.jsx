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
        <h2>
          {store.store_chain} {store.name}
        </h2>
        <p>{store.address}</p>
        <p>
          <b>Kontaktinfo:</b>
        </p>
        <p>{store.email}</p>
        <p>{store.phone_number}</p>

        <p>Trenger ansatte: {shiftsCount}</p>
      </div>
    </Link>
  );
};

export default ButikkCard;
