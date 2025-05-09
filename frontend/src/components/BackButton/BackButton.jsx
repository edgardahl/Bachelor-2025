import React from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBackOutline } from "react-icons/io5";
import "./BackButton.css";

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <div className="back-button" onClick={() => navigate(-1)}>
      <IoArrowBackOutline />
      <span className="back-text">Tilbake</span>
    </div>
  );
};

export default BackButton;
