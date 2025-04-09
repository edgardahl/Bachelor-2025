import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../api/axiosInstance";
import DeleteShiftPopup from "../../components/Popup/DeleteShiftPopup/DeleteShiftPopup";
import ClaimShiftPopup from "../../components/Popup/ClaimShiftPopup/ClaimShiftPopup";
import ErrorPopup from "../../components/Popup/ErrorPopup/ErrorPopup";
import "./ShiftDetailsPage.css";
import { set } from "lodash";
import { Link } from "react-router-dom";
import useAuth from "../../context/UseAuth";

const ShiftDetailsPage = () => {
  const { user } = useAuth(); // Get the user from context
  const { shiftId } = useParams(); // Get the shiftId from the URL params
  const [shiftDetails, setShiftDetails] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false); // State for the delete popup
  const [showClaimPopup, setShowClaimPopup] = useState(false); // State for the claim popup
  const [error, setError] = useState(null); // State to handle error in deleting
  const [storeId, setStoreId] = useState(null); // State to store the user's store ID
  const [userRole, setUserRole] = useState(null); // State to store the user's role
  const [userId, setUserId] = useState(null); // State to store the user's ID
  const [isLoading, setIsLoading] = useState(false); // State to manage loading state
  const [successMessage, setSuccessMessage] = useState(null); // State to manage success message
  const navigate = useNavigate(); // To navigate to other pages

  useEffect(() => {
    const fetchShiftDetails = async () => {
      try {
        const response = await axios.get(`/shifts/${shiftId}`);
        setShiftDetails(response.data[0]);
      } catch (error) {
        console.error("Error fetching shift details:", error);
        setError("Failed to fetch shift details.");
      }
    };

    const fetchUserDetails = async () => {
      try {
        setUserId(user.id);
        setStoreId(user.storeId);
        setUserRole(user.role);
        console.log("User ID:", user.id, "Store ID:", user.storeId, "Role:", user.role);
      } catch (error) {
        console.error("Error fetching user details:", error);
        setError("Failed to fetch user details.");
      }
    };

    fetchUserDetails(); // Fetch user details
    fetchShiftDetails(); // Fetch shift details
  }, [shiftId]);

  // Function to handle shift deletion
  const handleDeleteShift = async () => {
    setIsLoading(true); // Set loading state to true
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
        setError("Failed to delete the shift."); // Set error message
      }
    } catch (error) {
      console.error("Error during deletion:", error);
      setError("An error occurred while deleting the shift."); // Set error message
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  // Function to handle claiming a shift
  const handleClaimShift = async () => {
    setIsLoading(true); // Set loading state to true
    try {
      console.log("Claiming shift with ID:", shiftId);

      const response = await axios.post(`/shifts/claim/${shiftId}`, {
        user_id: userId,
      });

      if (response.status === 200) {
        alert("Shift successfully claimed!");

        // Update the shift details with the claimed user's information
        setShiftDetails((prevDetails) => ({
          ...prevDetails,
          claimed_by_first_name: response.data.claimed_by_first_name,
          claimed_by_last_name: response.data.claimed_by_last_name,
          claimed_by_email: response.data.claimed_by_email,
          claimed_by_phone: response.data.claimed_by_phone,
          claimed_by_id: userId, // Update claimed_by_id with the current user's ID
        }));
        setShowClaimPopup(false);
        setSuccessMessage("Vakten ble reservert"); // Set success message
      } else {
        setError("Failed to claim the shift."); // Set error message
      }
    } catch (error) {
      console.error("Error claiming shift:", error);
      setError("An error occurred while claiming the shift."); // Set error message
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  const handleCancel = () => {
    setShowDeletePopup(false); // Close the popup if canceled
  };

  const handleCancelClaim = () => {
    setShowClaimPopup(false); // Close the popup if canceled
  };

  const handleErrorPopupClose = () => {
    setShowErrorPopup(false); // Close the error popup
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

  if (isLoading) {
    return <div className="loading-message">Loading...</div>;
  }

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
          {shiftDetails.claimed_by_first_name ? (
            <Link to={`/dashboard/butikksjef/butikkansatt/${shiftDetails.claimed_by_id}`}>
              {shiftDetails.claimed_by_first_name} {shiftDetails.claimed_by_last_name}
            </Link>
          ) : (
            "Not yet claimed"
          )}
        </p>
      </div>

      {/* Conditionally render the delete button */}
      {canDelete && (
        <button
          className="delete-button"
          onClick={() => setShowDeletePopup(true)}
        >
          Slett vakt
        </button>
      )}

      {/* Conditionally render the claim button */}
      {canClaim && (
        <button
          className="claim-button"
          onClick={() => setShowClaimPopup(true)}
        >
          Ta vakt
        </button>
      )}

      {/* Render the claim confirmation popup */}
      {showClaimPopup && (
        <ClaimShiftPopup
          shiftTitle={shiftDetails.title}
          onCancel={handleCancelClaim}
          onConfirm={handleClaimShift}
        />
      )}

      {/* Render the delete confirmation popup */}
      {showDeletePopup && (
        <DeleteShiftPopup
          shiftTitle={shiftDetails.title}
          onCancel={handleCancel}
          onConfirm={handleDeleteShift}
        />
      )}

      {/* Render the error popup if there's an error */}
      {error && (
        <ErrorPopup
          message={error}
          onClose={() => setError(null)} // Clear the error when the popup is closed
        />
      )}

      {/* Render the success message if there's one */}
      {successMessage && <SuccessPopup onClose={handleCloseSuccessPopup} />}

      {/* Render the error popup if there's an error */}
      {error && <ErrorPopup message={error} onClose={handleErrorPopupClose} />}
    </div>
  );
};

export default ShiftDetailsPage;
