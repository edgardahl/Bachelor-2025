import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // To access the shiftId from the URL and use navigate
import axios from "../../api/axiosInstance"; // Assuming you are using axios for API calls
import DeleteShiftPopup from "../../components/DeleteShiftPopup/DeleteShiftPopup"; // Import DeleteShiftPopup component
import "./ShiftDetailsPage.css";

const ShiftDetailsPage = () => {
  const { shiftId } = useParams(); // Get the shiftId from the URL params
  const [shiftDetails, setShiftDetails] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false); // State for the delete popup
  const [error, setError] = useState(null); // State to handle error in deleting
  const [storeId, setStoreId] = useState(null); // State to store the user's store ID
  const navigate = useNavigate(); // To navigate to other pages

  useEffect(() => {
    const fetchShiftDetails = async () => {
      try {
        const response = await axios.get(`/shifts/${shiftId}`);
        console.log("Shift details response:", response.data);
        setShiftDetails(response.data[0]); // Assuming your API returns the shift details for a specific shiftId
      } catch (error) {
        console.error("Error fetching shift details:", error);
        setError("Failed to fetch shift details.");
      }
    };

    const fetchUserStore = async () => {
        try {
          const response = await axios.get("/auth/me");
          const storeId = response.data.user.storeId;
          setStoreId(storeId);
        } catch (error) {
          console.error("Error fetching user:", error);
        }
      };

    fetchUserStore(); // Fetch user store details
    fetchShiftDetails();
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

  const handleCancel = () => {
    setShowDeletePopup(false); // Close the popup if canceled
  };

  if (!shiftDetails) {
    return <div className="loading-message">Loading...</div>;
  }

  // Safely handle qualifications being null or undefined
  const qualifications = shiftDetails.qualifications && Array.isArray(shiftDetails.qualifications)
    ? shiftDetails.qualifications.join(", ")
    : "No qualifications available";

  // Conditionally render the delete button based on user and shift store association
  const canDelete = shiftDetails.store_id === storeId; // Add logic to check if the user can delete this shift
  console.log("Can delete:", canDelete);
  console.log("Shift store id:", shiftDetails.store_id);
    console.log("User store id:", storeId);

  return (
    <div className="shift-details-container">
      <div className="shift-header">
        <h2 className="shift-title">{shiftDetails.title}</h2>
      </div>

      <div className="shift-details">
        <p className="shift-info"><strong>Store:</strong> {shiftDetails.store_name}</p>
        <p className="shift-info"><strong>Description:</strong> {shiftDetails.description}</p>
        <p className="shift-info"><strong>Date:</strong> {shiftDetails.date}</p>
        <p className="shift-info"><strong>Start Time:</strong> {shiftDetails.start_time}</p>
        <p className="shift-info"><strong>End Time:</strong> {shiftDetails.end_time}</p>
        <p className="shift-info"><strong>Qualifications:</strong> {qualifications}</p>
        <p className="shift-info"><strong>Store Address:</strong> {shiftDetails.store_address}</p>
        <p className="shift-info"><strong>Posted By:</strong> {shiftDetails.posted_by_first_name}</p>
        <p className="shift-info"><strong>Posted By Email:</strong> {shiftDetails.posted_by_email}</p>
        <p className="shift-info"><strong>Posted By Phone:</strong> {shiftDetails.posted_by_phone}</p>
        <p className="shift-info"><strong>Claimed By:</strong> {shiftDetails.claimed_by_first_name} {shiftDetails.claimed_by_last_name || "N/A"}</p>
        <p className="shift-info"><strong>Store Email:</strong> {shiftDetails.store_email}</p>
        <p className="shift-info"><strong>Store Phone:</strong> {shiftDetails.store_phone}</p>
      </div>

      {/* Conditionally render the delete button */}
      {canDelete && (
        <button className="delete-button" onClick={() => setShowDeletePopup(true)}>
          🗑️ Delete Shift
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
