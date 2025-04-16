import React from "react";
import { useNavigate } from "react-router-dom";
import "./BackButton.css";

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <div className="back-button" onClick={() => navigate(-1)}>
      <img
        src="/icons/back-arrow.svg"
        className="arrow"
        alt="Tilbake"
        width="24"
        height="24"
      />
      <span className="back-text">Tilbake</span>
    </div>
  );
};

export default BackButton;
