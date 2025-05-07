import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "../../api/axiosInstance";
import DeleteShiftPopup from "../../components/Popup/DeleteShiftPopup/DeleteShiftPopup";
import ClaimShiftPopup from "../../components/Popup/ClaimShiftPopup/ClaimShiftPopup";

import ErrorPopup from "../../components/Popup/ErrorPopup/ErrorPopup";
import SuccessPopup from "../../components/Popup/SuccessPopup/SuccessPopup";
import BackButton from "../../components/BackButton/BackButton";
import Loading from "../../components/Loading/Loading";

import useAuth from "../../context/UseAuth";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ShiftDetailsPage.css";

const ShiftDetailsPage = () => {
  const { user } = useAuth();
  const { shiftId } = useParams();
  const navigate = useNavigate();

  const [shiftDetails, setShiftDetails] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showClaimPopup, setShowClaimPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const userId = user?.id;
  const storeId = user?.storeId;
  const userRole = user?.role;

  console.log(user)
  console.log(shiftDetails)

  useEffect(() => {
    const fetchShiftDetails = async () => {
      try {
        const res = await axios.get(`/shifts/${shiftId}`);
        setShiftDetails(res.data[0]);
      } catch (err) {
        console.error("Feil ved henting av vakt:", err);
        toast.error("Kunne ikke hente vaktinformasjon.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchShiftDetails();
  }, [shiftId]);

  const handleDeleteShift = async () => {
    setIsLoading(true);
    try {
      const res = await axios.delete("/shifts/deleteShiftById", {
        data: { shiftId, shiftStoreId: shiftDetails.store_id },
      });

      if (res.status === 200) {
        setShowDeletePopup(false);
        toast.success("Vakten ble slettet.");
        navigate("/bs/hjem");
      } else {
        toast.error("Kunne ikke slette vakten.");
      }
    } catch (err) {
      console.error("Feil ved sletting:", err);
      toast.error("En feil oppstod ved sletting.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimShift = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post(`/shifts/claim/${shiftId}`, {
        user_id: userId,
      });

      if (res.status === 200) {
        setShiftDetails((prev) => ({
          ...prev,
          claimed_by_first_name: res.data.claimed_by_first_name,
          claimed_by_last_name: res.data.claimed_by_last_name,
          claimed_by_email: res.data.claimed_by_email,
          claimed_by_phone: res.data.claimed_by_phone,
          claimed_by_id: userId,
        }));
        toast.success("Vakten ble reservert.");
        setShowClaimPopup(false);
      } else {
        toast.error("Kunne ikke reservere vakten.");
      }
    } catch (err) {
      console.error("Feil ved reservasjon:", err);
      toast.error("En feil oppstod ved reservasjon.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !shiftDetails) {
    return <Loading />;
  }

  const qualifications = Array.isArray(shiftDetails.qualifications)
  ? shiftDetails.qualifications.map((q) => q.name).join(", ")
  : "Ingen krav spesifisert";

  const canDelete =
    userRole === "store_manager" && shiftDetails.store_id === storeId;

    const requiredQualifications = Array.isArray(shiftDetails.qualifications)
    ? shiftDetails.qualifications
    : [];
  
  const userQualifications = Array.isArray(user?.user_qualifications)
    ? user.user_qualifications
    : [];
  
    //logs shift and user qualic
    
    const requiredQualificationIds = requiredQualifications.map((q) => q.qualification_id);
    const hasAllQualifications = requiredQualificationIds.every((id) =>
    userQualifications.includes(id)
    );
    console.log("Shift qualifications:", requiredQualifications);
    console.log("User qualifications:", userQualifications);

  
  const shiftIsClaimed = !!shiftDetails.claimed_by_first_name;
  
  const canClaim = userRole === "employee" && !shiftIsClaimed && hasAllQualifications;
  
  let claimDisabledReason = "";
  if (shiftIsClaimed) {
    claimDisabledReason = "Vakten er allerede tatt.";
  } else if (!hasAllQualifications) {
    claimDisabledReason = "Du mangler nødvendige kvalifikasjoner.";
  }
  

  return (
    <>
      <BackButton />
      <div className="shift-details-container">
        <div className="shift-header">
          <h2 className="shift-title">{shiftDetails.title}</h2>
        </div>

        <div className="shift-details">
          <div className="shift-detail-section">
            <p>
              <strong>Butikk:</strong> {shiftDetails.store_name}
            </p>
            <p>
              <strong>Adresse:</strong> {shiftDetails.store_address}
            </p>
            <p>
              <strong>Dato:</strong> {shiftDetails.date}
            </p>
            <p>
              <strong>Tid:</strong> {shiftDetails.start_time} -{" "}
              {shiftDetails.end_time}
            </p>
            <p>
              <strong>Beskrivelse:</strong>{" "}
              {shiftDetails.description?.trim() || "Ingen beskrivelse"}
            </p>
            <p>
              <strong>Kvalifikasjoner:</strong> {qualifications}
            </p>
            <p>
              <strong>Publisert av:</strong> {shiftDetails.posted_by_first_name}{" "}
              {shiftDetails.posted_by_last_name}
            </p>

            {userRole === "store_manager" && (
              <p>
                <strong>Reservert av:</strong>{" "}
                {shiftDetails.claimed_by_first_name ? (
                  <Link to={`/bs/ansatte/profil/${shiftDetails.claimed_by_id}`}>
                    {shiftDetails.claimed_by_first_name}{" "}
                    {shiftDetails.claimed_by_last_name}
                  </Link>
                ) : (
                  "Ingen"
                )}
              </p>
            )}
          </div>

          <div className="shift-actions">
          {userRole === "employee" && (
            <div className="claim-button-wrapper">
              <button
                className="claim-button"
                onClick={() => setShowClaimPopup(true)}
                disabled={!canClaim}
              >
                Ta vakt
              </button>
              {!canClaim && (
                <p className="claim-disabled-reason">{claimDisabledReason}</p>
              )}
            </div>
          )}

            {canDelete && (
              <button
                className="delete-button"
                onClick={() => setShowDeletePopup(true)}
              >
                <img src="/icons/delete-white.svg" alt="Slett" />
              </button>
            )}
          </div>
        </div>

        {showDeletePopup && (
          <DeleteShiftPopup
            shiftTitle={shiftDetails.title}
            onCancel={() => setShowDeletePopup(false)}
            onConfirm={handleDeleteShift}
          />
        )}

        {showClaimPopup && (
          <ClaimShiftPopup
            shiftTitle={shiftDetails.title}
            onCancel={() => setShowClaimPopup(false)}
            onConfirm={handleClaimShift}
          />
        )}
      </div>
    </>
  );
};

export default ShiftDetailsPage;
