import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // To access the shiftId from the URL
import axios from "../../api/axiosInstance"; // Assuming you are using axios for API calls
import "./ShiftDetailsPage.css";

const ShiftDetailsPage = () => {
  const { shiftId } = useParams(); // Get the shiftId from the URL params
  const [shiftDetails, setShiftDetails] = useState(null);

  useEffect(() => {
    const fetchShiftDetails = async () => {
      try {
        const response = await axios.get(`/shifts/${shiftId}`);
        console.log("Shift details response:", response.data);
        setShiftDetails(response.data[0]); // Assuming your API returns the shift details for a specific shiftId
      } catch (error) {
        console.error("Error fetching shift details:", error);
      }
    };

    fetchShiftDetails();
  }, [shiftId]);

  if (!shiftDetails) {
    return <div className="loading-message">Loading...</div>;
  }

  // Safely handle qualifications being null or undefined
  const qualifications = shiftDetails.qualifications && Array.isArray(shiftDetails.qualifications)
    ? shiftDetails.qualifications.join(", ")
    : "No qualifications available";

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
    </div>
  );
};

export default ShiftDetailsPage;
