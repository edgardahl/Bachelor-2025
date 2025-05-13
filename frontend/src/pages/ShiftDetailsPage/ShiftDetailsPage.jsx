import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "../../api/axiosInstance";
import ConfirmDeletePopup from "../../components/Popup/ConfirmDeletePopup/ConfirmDeletePopup";
import ClaimShiftPopup from "../../components/Popup/ClaimShiftPopup/ClaimShiftPopup";
import BackButton from "../../components/BackButton/BackButton";
import Loading from "../../components/Loading/Loading";
import ButikkCard from "../../components/Cards/ButikkCard/ButikkCard";
import useAuth from "../../context/UseAuth";
import { toast } from "react-toastify";
import "./ShiftDetailsPage.css";

const ShiftDetailsPage = () => {
  const { user } = useAuth();
  const { shiftId } = useParams();
  const navigate = useNavigate();

  const [shiftDetails, setShiftDetails] = useState(null);
  const [shiftsCount, setShiftsCount] = useState(0);
  const [qualificationMap, setQualificationMap] = useState({});
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showClaimPopup, setShowClaimPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const userId = user?.id;
  const storeId = user?.storeId;
  const userRole = user?.role;

  // Hent detaljer for en vakt ved innlasting
  useEffect(() => {
    const fetchShiftDetails = async () => {
      try {
        const res = await axios.get(`/shifts/${shiftId}`);
        setShiftDetails(res.data[0]);
      } catch {
        toast.error("Kunne ikke hente vaktinformasjon.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchShiftDetails();
  }, [shiftId]);

  // Hent antall andre vakter for samme butikk
  useEffect(() => {
    const fetchShiftsForStore = async () => {
      if (!shiftDetails?.store_id) return;
      try {
        const res = await axios.get(`/shifts/store/${shiftDetails.store_id}`);
        setShiftsCount(res.data.length);
      } catch {
        setShiftsCount(0);
      }
    };
    fetchShiftsForStore();
  }, [shiftDetails]);

  // Hent alle kvalifikasjoner og lag et oppslag (id → navn)
  useEffect(() => {
    const fetchQualifications = async () => {
      try {
        const res = await axios.get("/qualifications");
        const map = res.data.reduce((acc, q) => {
          acc[q.qualification_id] = q.name;
          return acc;
        }, {});
        setQualificationMap(map);
      } catch {
        console.error("Feil ved henting av kvalifikasjoner");
      }
    };
    fetchQualifications();
  }, []);

  // Slett vakt fra backend og naviger tilbake ved suksess
  const handleDeleteShift = async () => {
    setIsLoading(true);
    try {
      const res = await axios.delete("/shifts/deleteShiftById", {
        data: { shiftId, shiftStoreId: shiftDetails.store_id },
      });
      if (res.status === 200) {
        toast.success("Vakten ble slettet.");
        setShowDeletePopup(false);
        navigate("/bs/hjem");
      } else {
        toast.error("Kunne ikke slette vakten.");
      }
    } catch {
      toast.error("En feil oppstod ved sletting.");
    } finally {
      setIsLoading(false);
    }
  };

  // Reserver vakt for bruker og oppdater visning
  const handleClaimShift = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post(`/shifts/claim/${shiftId}`, {
        user_id: userId,
      });
      if (res.status === 200) {
        // Oppdaterer lokalt at vakten er reservert
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
    } catch {
      toast.error("En feil oppstod ved reservasjon.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !shiftDetails) return <Loading />;

  // Beregn om bruker kan kreve eller slette vakten
  const requiredQualifications = shiftDetails.qualifications || [];
  const userQualifications = user?.user_qualifications || [];
  const claimedByYou = shiftDetails.claimed_by_id === userId;
  const hasAllQualifications = requiredQualifications.every((q) =>
    userQualifications.includes(q.qualification_id)
  );
  const shiftIsClaimed = !!shiftDetails.claimed_by_first_name;
  const canDelete =
    userRole === "store_manager" && shiftDetails.store_id === storeId;
  const canClaim =
    userRole === "employee" &&
    !shiftIsClaimed &&
    hasAllQualifications &&
    !claimedByYou;

  // Begrunnelse for hvorfor knapp for reservasjon er deaktivert
  let claimDisabledReason = "";
  if (claimedByYou)
    claimDisabledReason = "Du har allerede reservert denne vakten";
  else if (shiftIsClaimed) claimDisabledReason = "Vakten er allerede tatt.";
  else if (!hasAllQualifications)
    claimDisabledReason = "Du mangler nødvendige kvalifikasjoner.";
  return (
    <>
      <BackButton />
      <div className="shift-details-container">
        <div className="shift-header">
          <h2 className="shift-title">{shiftDetails.title}</h2>
        </div>

        <div className="shift-details two-column-layout">
          <div className="shift-left">
            <ButikkCard
              store={{
                store_id: shiftDetails.store_id,
                name: shiftDetails.store_name,
                address: shiftDetails.store_address,
                store_chain: shiftDetails.store_chain,
              }}
              shiftsCount={shiftsCount}
            />
          </div>

          <div className="shift-right">
            <div className="shift-detail-section">
              <p>
                <strong>Dato:</strong> {shiftDetails.date}
              </p>
              <p>
                <strong>Tid:</strong> {shiftDetails.start_time?.slice(0, 5)} -{" "}
                {shiftDetails.end_time?.slice(0, 5)}
              </p>

              <p>
                <strong>Beskrivelse:</strong>{" "}
                {shiftDetails.description?.trim() || "Ingen beskrivelse"}
              </p>

              <div className="published-info">
                <p>
                  <strong>Publisert av:</strong>{" "}
                  {shiftDetails.posted_by_first_name}{" "}
                  {shiftDetails.posted_by_last_name}
                </p>
                {shiftDetails.posted_by_email && (
                  <p>
                    <strong>E-post:</strong> {shiftDetails.posted_by_email}
                  </p>
                )}
                {shiftDetails.posted_by_phone && (
                  <p>
                    <strong>Telefon:</strong> {shiftDetails.posted_by_phone}
                  </p>
                )}
                {userRole === "store_manager" && (
                  <div className="reserved-by">
                    <strong>Reservert av:</strong>{" "}
                    {shiftDetails.claimed_by_first_name ? (
                      <Link
                        to={`/bs/ansatte/profil/${shiftDetails.claimed_by_id}`}
                      >
                        {shiftDetails.claimed_by_first_name}{" "}
                        {shiftDetails.claimed_by_last_name}
                      </Link>
                    ) : (
                      "Ingen"
                    )}
                  </div>
                )}
              </div>

              <div className="qualifications-header">
                <p>
                  <strong>Nødvendige kvalifikasjoner:</strong>
                </p>
              </div>

              <div className="qualification-cards">
                {requiredQualifications.length > 0 ? (
                  requiredQualifications.map((q) => (
                    <div
                      key={q.qualification_id}
                      className="qualification-card selected disabled"
                    >
                      <h4>{qualificationMap[q.qualification_id] || q.name}</h4>
                      <span className="checkmark">✔</span>
                    </div>
                  ))
                ) : (
                  <p>Ingen krav spesifisert</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="shift-bottom-row">
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
                <p
                  className={`claim-disabled-reason ${
                    claimedByYou ? "success" : ""
                  }`}
                >
                  {claimDisabledReason}
                </p>
              )}
            </div>
          )}
        </div>

        {canDelete && (
          <div className="shift-actions-bottom">
            <button
              className="delete-button"
              onClick={() => setShowDeletePopup(true)}
            >
              Slett vakt
            </button>
          </div>
        )}

        {showDeletePopup && (
          <ConfirmDeletePopup
            title="vakt"
            itemName={shiftDetails.title}
            onCancel={() => setShowDeletePopup(false)}
            onConfirm={handleDeleteShift}
          />
        )}

        {showClaimPopup && (
          <ClaimShiftPopup
            shiftTitle={shiftDetails.title}
            date={shiftDetails.date}
            startTime={shiftDetails.start_time}
            endTime={shiftDetails.end_time}
            onCancel={() => setShowClaimPopup(false)}
            onConfirm={handleClaimShift}
          />
        )}
      </div>
    </>
  );
};

export default ShiftDetailsPage;
