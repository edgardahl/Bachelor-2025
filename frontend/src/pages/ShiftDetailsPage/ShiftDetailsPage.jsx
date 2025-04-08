import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../api/axiosInstance";
import DeleteShiftPopup from "../../components/DeleteShiftPopup/DeleteShiftPopup";
import "./ShiftDetailsPage.css";

const ShiftDetailsPage = () => {
  const { shiftId } = useParams(); // Get the shiftId from the URL params
  const [shiftDetails, setShiftDetails] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false); // State for the delete popup
  const [error, setError] = useState(null); // State to handle error in deleting
  const [storeId, setStoreId] = useState(null); // State to store the user's store ID
  const [userRole, setUserRole] = useState(null); // State to store the user's role
  const [userId, setUserId] = useState(null); // State to store the user's ID
  const navigate = useNavigate(); // To navigate to other pages

  useEffect(() => {
    const fetchShiftDetails = async () => {
      try {
        const response = await axios.get(`/shifts/${shiftId}`);
        setShiftDetails(response.data[0]); // Assuming your API returns the shift details for a specific shiftId
      } catch (error) {
        console.error("Error fetching shift details:", error);
        setError("Failed to fetch shift details.");
      }
    };

    const fetchUserDetails = async () => {
      try {
        const response = await axios.get("/auth/me");
        const { id, storeId, role } = response.data.user;
        setUserId(id); // Set the user's ID
        setStoreId(storeId);
        setUserRole(role); // Set the user's role
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails(); // Fetch user details
    fetchShiftDetails(); // Fetch shift details
  }, [shiftId]);

  // Function to handle shift deletion
  const handleDeleteShift = async () => {
    try {
      const response = await axios.delete("/shifts/deleteShiftById", {
        data: {
          shiftId: shiftId, // shiftId to be deleted
          shiftStoreId: shiftDetails.store_id, // store ID of the shift
        },
      });

      if (response.status === 200) {
        console.log("Shift deleted successfully:", response.data.message);
        setShowDeletePopup(false); // Close the popup after confirming
        navigate("/dashboard/butikksjef/butikker"); // Redirect back to the store page or wherever you want
      } else {
        console.error("Error deleting shift:", response.data.error);
        alert(response.data.error); // Show error message if deletion fails
      }
    } catch (error) {
      console.error("Error during deletion:", error);
      alert("Failed to delete shift.");
    }
  };

  // Function to handle claiming a shift
  const handleClaimShift = async () => {
    try {
      console.log("Claiming shift with ID:", shiftId);

      const response = await axios.post(`/shifts/claim/${shiftId}`, {
        user_id: userId,
      });

      if (response.status === 200) {
        alert("Shift successfully claimed!");
        // Optionally, refetch shift details to update the UI
        setShiftDetails((prevDetails) => ({
          ...prevDetails,
          claimed_by_first_name: response.data.claimed_by_first_name,
          claimed_by_last_name: response.data.claimed_by_last_name,
        }));
      } else {
        alert("Failed to claim shift.");
      }
    } catch (error) {
      console.error("Error claiming shift:", error);
      alert("Failed to claim shift.", error);
    }
  };

  const handleCancel = () => {
    setShowDeletePopup(false); // Close the popup if canceled
  };

  if (!shiftDetails) {
    return <div className="loading-message">Loading...</div>;
  }

  // Safely handle qualifications being null or undefined
  const qualifications =
    shiftDetails.qualifications && Array.isArray(shiftDetails.qualifications)
      ? shiftDetails.qualifications.join(", ")
      : "No qualifications available";

  // Conditionally render the delete button based on user role and store association
  const canDelete =
    userRole === "store_manager" && shiftDetails.store_id === storeId;

  // Conditionally render the claim button based on user role
  const canClaim =
    userRole === "employee" && !shiftDetails.claimed_by_first_name;

  return (
    <div className="shift-details-container">
      <div className="shift-header">
        <h2 className="shift-title">{shiftDetails.title}</h2>
      </div>

      <div className="shift-details">
        <p className="shift-info">
          <strong>Store:</strong> {shiftDetails.store_name}
        </p>
        <p className="shift-info">
          <strong>Description:</strong> {shiftDetails.description}
        </p>
        <p className="shift-info">
          <strong>Date:</strong> {shiftDetails.date}
        </p>
        <p className="shift-info">
          <strong>Start Time:</strong> {shiftDetails.start_time}
        </p>
        <p className="shift-info">
          <strong>End Time:</strong> {shiftDetails.end_time}
        </p>
        <p className="shift-info">
          <strong>Qualifications:</strong> {qualifications}
        </p>
        <p className="shift-info">
          <strong>Store Address:</strong> {shiftDetails.store_address}
        </p>
        <p className="shift-info">
          <strong>Posted By:</strong> {shiftDetails.posted_by_first_name}
        </p>
        <p className="shift-info">
          <strong>Claimed By:</strong>{" "}
          {shiftDetails.claimed_by_first_name
            ? `${shiftDetails.claimed_by_first_name} ${shiftDetails.claimed_by_last_name}`
            : "Not yet claimed"}
        </p>
      </div>

      {/* Conditionally render the delete button */}
      {canDelete && (
        <button
          className="delete-button"
          onClick={() => setShowDeletePopup(true)}
        >
          🗑️ Delete Shift
        </button>
      )}

      {/* Conditionally render the claim button */}
      {canClaim && (
        <button className="claim-button" onClick={handleClaimShift}>
          Claim Shift
        </button>
      )}

      {/* Render the delete confirmation popup */}
      {showDeletePopup && (
        <DeleteShiftPopup
          shiftTitle={shiftDetails.title}
          onCancel={handleCancel}
          onConfirm={handleDeleteShift}
        />
      )}
    </div>
  );
};

export default ShiftDetailsPage;
