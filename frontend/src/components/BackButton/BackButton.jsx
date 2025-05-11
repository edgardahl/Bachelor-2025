import React from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBackOutline } from "react-icons/io5";
import "./BackButton.css";

const BackButton = ({ to, onClick }) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    } else if (to) {
      navigate(to);
    } else {
      navigate(-1);
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
