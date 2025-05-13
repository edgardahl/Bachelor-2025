import React from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBackOutline } from "react-icons/io5";
import "./BackButton.css";

const BackButton = ({ to, onClick }) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (onClick) {
      onClick(e); // Kjører egendefinert funksjon hvis sendt inn
    } else if (to) {
      navigate(to); // Navigerer til angitt rute hvis "to" er spesifisert
    } else {
      navigate(-1); // Går tilbake i historikken hvis ingen props er sendt
    }
  };

  return (
    <div className="back-button" onClick={handleClick}>
      <IoArrowBackOutline />
      <span className="back-text">Tilbake</span>
    </div>
  );
};

export default BackButton;
