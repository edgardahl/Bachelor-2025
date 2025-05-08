import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DeleteShiftPopup from "../../Popup/DeleteShiftPopup/DeleteShiftPopup";
import axios from "../../../api/axiosInstance";
import "./ShiftCard.css";
import useAuth from "../../../context/UseAuth";
import { FiClock, FiMapPin, FiAward, FiCheckCircle } from "react-icons/fi";
import { toast } from "react-toastify";

const ShiftCard = ({
  shiftId,
  title,
  date,
  startTime,
  endTime,
  qualifications,
  storeName,
  storeChain,
  shiftStoreId,
  deleteShift,
  claimedByName,
  claimedById,
}) => {
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth(); // Bruker informasjon for å sjekke om de er logget inn
  const shiftDate = new Date(date);
  const day = shiftDate.getDate();
  const month = shiftDate.toLocaleString("nb-NO", { month: "short" });

  const handleCardClick = () => {
    if (user?.role) {
      const rolePath = user.role === "employee" ? "ba" : "bs";
      navigate(`/${rolePath}/vakter/detaljer/${shiftId}`);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      const res = await axios.delete("/shifts/deleteShiftById", {
        data: {
          shiftId,
          shiftStoreId,
        },
      });
      if (res.status === 200) {
        deleteShift(shiftId);
        setShowDeletePopup(false);
        toast.success("Vakt slettet.");
      } else {
        toast.error(res.data.error || "Kunne ikke slette vakt.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Noe gikk galt ved sletting av vakt.");
    }
  };

  const isDisabled = !user?.role; // Sjekk om brukeren er logget inn

  return (
    <div
      className={`shift-card-container ${claimedById ? "claimed" : ""} ${
        isDisabled ? "disabled" : ""
      }`}
      onClick={isDisabled ? null : handleCardClick} // Hindre klikk når kortet er deaktivert
    >
      {showDeletePopup && (
        <DeleteShiftPopup
          shiftTitle={title}
          onCancel={() => setShowDeletePopup(false)}
          onConfirm={handleConfirmDelete}
        />
      )}

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
              <p className="info-p-location">{storeChain} {storeName}</p>
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
        <div className="les-mer-text">
          <span>Les mer →</span>
        </div>
      </div>
    </div>
  );
};

export default ShiftCard;
