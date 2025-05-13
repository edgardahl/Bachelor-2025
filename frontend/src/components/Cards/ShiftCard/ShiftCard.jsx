import React from "react";
import { useNavigate } from "react-router-dom";
import "./ShiftCard.css";
import useAuth from "../../../context/UseAuth";
import { FiClock, FiMapPin, FiAward, FiCheckCircle } from "react-icons/fi";

const ShiftCard = ({
  shiftId,
  title,
  date,
  startTime,
  endTime,
  qualifications,
  storeName,
  storeChain,
  claimedByName,
  claimedById,
  showLesMer = true,
  interactive = true,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Formaterer dato til dag og månedsnavn (norsk)
  const shiftDate = new Date(date);
  const day = shiftDate.getDate();
  const month = shiftDate.toLocaleString("nb-NO", { month: "short" });

  // Navigerer brukeren til riktig detaljside basert på rolle
  const handleCardClick = () => {
    if (interactive && user?.role) {
      const rolePath = user.role === "employee" ? "ba" : "bs";
      navigate(`/${rolePath}/vakter/detaljer/${shiftId}`);
    }
  };

  return (
    <div
      className={`shift-card-container ${claimedById ? "claimed" : ""} ${
        !interactive ? "disabled" : ""
      }`}
      onClick={interactive ? handleCardClick : null}
    >
      {/* Viser "TATT"-merke hvis vakten er tatt */}
      {claimedById && <div className="claimed-ribbon" />}

      <div className="shift-card-header">
        <h3>{title}</h3>
      </div>

      <div className="shift-card-info">
        <div className="shift-card-info-left">
          <div className="date-container">
            <div className="day">{day}</div>
            <div className="month">{month}</div>
          </div>
        </div>

        <div className="shift-card-info-right">
          <ul className="info-list">
            <li className="info-list-item">
              <FiClock className="info-icon" size={22} />
              <p className="info-p-time">
                {startTime.slice(0, 5)} - {endTime.slice(0, 5)}
              </p>
            </li>
            <li className="info-list-item">
              <FiMapPin className="info-icon" size={22} />
              <p className="info-p-location">
                {storeChain} {storeName}
              </p>
            </li>
            <li className="info-list-item">
              <FiAward className="info-icon" size={22} />
              <p className="info-p-qualification">
                {qualifications.join(", ")}
              </p>
            </li>
          </ul>
        </div>
      </div>

      <div className="shift-card-footer">
        {/* Viser hvem som har tatt vakten hvis den er claimed */}
        <div
          className="claimed-by-text"
          style={{
            visibility:
              claimedById && claimedByName?.trim() ? "visible" : "hidden",
          }}
        >
          <FiCheckCircle className="claimed-check-icon" />
          <a
            href={`/bs/ansatte/profil/${claimedById}`}
            onClick={(e) => e.stopPropagation()}
            className="claimed-link"
          >
            Tatt av: {claimedByName}
          </a>
        </div>

        {/* "Les mer"-lenke hvis aktivert */}
        {showLesMer && (
          <div className="les-mer-text">
            <span>Les mer →</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShiftCard;
