import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DeleteShiftPopup from "../../Popup/DeleteShiftPopup/DeleteShiftPopup"; // Import the popup
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
  deleteShift, // Function to handle deletion
}) => {
  const [showDeletePopup, setShowDeletePopup] = useState(false); // State to manage the popup visibility
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCardClick = () => {
    if (user.role === "employee") {
      navigate(`/ba/vakter/detaljer/${shiftId}`); // Employee-specific page
    } else if (user.role === "store_manager") {
      navigate(`/bs/vakter/detaljer/${shiftId}`); // Store manager-specific page
    } else {
      console.error("Unknown user role:", user.role); // Handle unexpected roles
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation(); // Prevent navigating when clicking on delete icon
    setShowDeletePopup(true); // Show the delete confirmation popup
  };

  const handleCancel = () => {
    setShowDeletePopup(false); // Close the popup
  };

  const handleConfirmDelete = async () => {
    try {
      // Sending the API request to delete the shift using axios
      const response = await axios.delete("/shifts/deleteShiftById", {
        data: {
          shiftId: shiftId, // shiftId to be deleted
          shiftStoreId: shiftStoreId, // store ID of the shift
        },
      });

      if (response.status === 200) {
        console.log("Shift deleted successfully:", response.data.message);
        deleteShift(shiftId); // Remove shift from state immediately
        setShowDeletePopup(false); // Close the popup after confirming
      } else {
        console.error("Error deleting shift:", response.data.error);
        alert(response.data.error); // Show error message if deletion fails
      }
    } catch (error) {
      console.error("Error during deletion:", error);
      alert("Failed to delete shift.");
    }
  };

  // Check if the current user is a manager and belongs to the store associated with this shift
  const canDelete =
    user.role === "store_manager" && shiftStoreId === usersstoreId;

  return (
    <div className="shift-card-container" onClick={handleCardClick}>
      <div className="shift-card-header">
        <h4 className="shift-card-title">{title}</h4>
      </div>

      <div className="shift-card-details">
        <p className="shift-card-store">{storeName}</p>
        <p className="shift-card-time">
          {date} | {startTime} - {endTime}
        </p>
        <p className="shift-card-qualifications">
          Qualifications: {qualifications.join(", ")}
        </p>
        <p>Posted by: {postedById === userId ? "YOU" : postedBy}</p>
      </div>

      {/* Conditionally render the delete icon */}
      {canDelete && (
        <button className="delete-button" onClick={handleDeleteClick}>
          🗑️
        </button>
      )}

      {/* Conditionally render the delete popup */}
      {showDeletePopup && (
        <DeleteShiftPopup
          shiftTitle={title}
          onCancel={handleCancel}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
};

export default ShiftCard;
