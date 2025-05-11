// Only showing the deletion part of the Profile component

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../api/axiosInstance";
import { toast } from "react-toastify";
import "./DeleteAccountPopup.css";

const DeleteAccountPopup = ({ user, formData, isOwnProfile }) => {
  const navigate = useNavigate();
  const [showDeleteUI, setShowDeleteUI] = useState(false);

  const canDeleteAccount =
    (isOwnProfile && user?.role === "employee") ||
    (user?.role === "store_manager" &&
      !isOwnProfile &&
      formData.role === "employee" &&
      user.storeId === formData.store_id) ||
    (user?.role === "admin" &&
      !isOwnProfile &&
      formData.role === "store_manager");

  const handleDelete = async () => {
    try {
      await axios.delete(`/users/${formData.user_id}`);
      toast.success("Konto slettet");
      if (isOwnProfile) {
        navigate("/login");
      } else if (user.role === "store_manager") {
        navigate("/bs/ansatte/mine");
      } else if (user.role === "admin") {
        navigate("/admin/butikksjefer");
      }
    } catch (err) {
      console.error("Feil ved sletting:", err);
      toast.error("Kunne ikke slette kontoen.");
    }
  };

  return (
    <>
      {canDeleteAccount && (
        <div className="delete-account-section">
          <button
            className="danger-button"
            onClick={() => setShowDeleteUI(true)}
          >
            Slett konto
          </button>
        </div>
      )}

      {showDeleteUI && (
        <div className="danger-overlay-background">
          <div className="delete-confirm-box">
            <h3>Bekreft sletting</h3>
            <p>Er du sikker på at du vil slette denne kontoen? Dette kan ikke angres.</p>
            <div className="delete-action-buttons">
              <button className="danger-button" onClick={handleDelete}>
                Ja, slett
              </button>
              <button
                className="danger-cancel-button"
                onClick={() => setShowDeleteUI(false)}
              >
                Avbryt
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteAccountPopup;
