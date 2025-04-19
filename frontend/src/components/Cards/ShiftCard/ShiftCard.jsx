import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DeleteShiftPopup from "../../Popup/DeleteShiftPopup/DeleteShiftPopup";
import axios from "../../../api/axiosInstance";
import "./ShiftCard.css";
import useAuth from "../../../context/UseAuth";
import { FiClock, FiMapPin, FiAward, FiCheckCircle } from "react-icons/fi";

const ShiftCard = ({
  shiftId,
  title,
  description,
  date,
  startTime,
  endTime,
  qualifications,
  storeName,
  postedBy,
  postedById,
  userId,
  usersstoreId,
  shiftStoreId,
  deleteShift,
  claimedByName,
  claimedById,
}) => {
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const shiftDate = new Date(date);
  const day = shiftDate.getDate();
  const month = shiftDate.toLocaleString("nb-NO", { month: "short" });

  const handleCardClick = () => {
    const rolePath = user.role === "employee" ? "ba" : "bs";
    navigate(`/${rolePath}/vakter/detaljer/${shiftId}`);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowDeletePopup(true);
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
      } else {
        alert(res.data.error || "Failed to delete shift.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Could not delete shift.");
    }
  };

  const canDelete =
    user.role === "store_manager" && shiftStoreId === usersstoreId;

  return (
    <div
      className={`shift-card-container ${claimedById ? "claimed" : ""}`}
      onClick={handleCardClick}
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
              <p className="info-p-location">{storeName}</p>
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
        <div className="claimed-by-text">
          {claimedById && claimedByName?.trim() ? (
            <>
              <FiCheckCircle className="claimed-check-icon" />
              <a
                href={`/bs/ansatte/profil/${claimedById}`}
                onClick={(e) => e.stopPropagation()}
                className="claimed-link"
              >
                Tatt av: {claimedByName}
              </a>
            </>
          ) : (
            <span>Tatt av: Ingen</span>
          )}
        </div>
        <div className="les-mer-text">
          <span>Les mer →</span>
        </div>
      </div>
    </div>
  );
};

export default ShiftCard;
