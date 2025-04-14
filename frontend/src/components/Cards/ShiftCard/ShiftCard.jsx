import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DeleteShiftPopup from "../../Popup/DeleteShiftPopup/DeleteShiftPopup";
import axios from "../../../api/axiosInstance";
import "./ShiftCard.css";
import useAuth from "../../../context/UseAuth";

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
}) => {
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

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
    <div className="shift-card-container" onClick={handleCardClick}>
      <div className="shift-card-header">
        <h4 className="shift-card-title">{title}</h4>
      </div>

      <div className="shift-card-body">
        <p className="shift-card-store">{storeName}</p>
        <p className="shift-card-time">
          {date} | {startTime} - {endTime}
        </p>
        <p className="shift-card-qualifications">
          <strong>Kvalifikasjoner:</strong>{" "}
          {qualifications?.length ? qualifications.join(", ") : "Ingen"}
        </p>
        <p className="shift-card-posted">
          <strong>Publisert av:</strong>{" "}
          {postedById === userId ? "Deg" : postedBy}
        </p>
      </div>

      {canDelete && (
        <button className="delete-bottom-btn" onClick={handleDeleteClick}>
          <img src="/icons/delete-white.svg" alt="Slett" />
        </button>
      )}

      {showDeletePopup && (
        <DeleteShiftPopup
          shiftTitle={title}
          onCancel={() => setShowDeletePopup(false)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
};

export default ShiftCard;
