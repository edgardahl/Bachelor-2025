import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Added
import axios from "../../../api/axiosInstance";
import useAuth from "../../../context/UseAuth";
import BackButton from "../../../components/BackButton/BackButton";
import { toast } from "react-toastify";
import CreateShiftConfirmModal from "../../../components/createShiftConfirmModal/createShiftConfirmModal";

import "./CreateShift.css";

const CreateShift = () => {
  const { user } = useAuth();
  const navigate = useNavigate(); // ✅ Added
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [qualifications, setQualifications] = useState([]);
  const [selectedQualifications, setSelectedQualifications] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [UserId, setUserId] = useState("");
  const [StoreId, setStoreId] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingShiftData, setPendingShiftData] = useState(null);

  useEffect(() => {
    if (user) {
      setUserId(user.id);
      setStoreId(user.storeId);
    }
  }, [user]);

  useEffect(() => {
    const fetchQualifications = async () => {
      try {
        const response = await axios.get("/qualifications");
        setQualifications(response.data);
      } catch (error) {
        console.error("Feil ved henting av kvalifikasjoner:", error);
      }
    };
    fetchQualifications();
  }, []);

  const handleQualificationChange = (qualificationId) => {
    setSelectedQualifications((prev) =>
      prev.includes(qualificationId)
        ? prev.filter((id) => id !== qualificationId)
        : [...prev, qualificationId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const shiftData = {
      title,
      description,
      date,
      start_time: startTime,
      end_time: endTime,
      qualifications: qualifications
        .filter((q) => selectedQualifications.includes(q.qualification_id))
        .map((q) => q.name),
      store_id: StoreId,
      posted_by: UserId,
    };

    setPendingShiftData(shiftData);
    setShowConfirmModal(true);
  };

  const confirmCreateShift = async () => {
    if (!pendingShiftData) return;

    setLoading(true);
    try {
      await axios.post("/shifts", {
        ...pendingShiftData,
        qualifications: selectedQualifications,
      });
      toast.success("Vakt opprettet");
      setDate("");
      setStartTime("");
      setEndTime("");
      setTitle("");
      setDescription("");
      setSelectedQualifications([]);
      navigate("/bs/vakter"); // ✅ Redirect after successful creation
    } catch (error) {
      console.error("Feil ved oppretting av vakt:", error);
      toast.error("Kunne ikke opprette vakt. Prøv igjen.");
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
      setPendingShiftData(null);
    }
  };

  return (
    <div className="create-shift-container">
      <BackButton />
      <h1>Ny vakt</h1>
      <form onSubmit={handleSubmit}>
        <div className="create-shift-form">
          <div className="form-step beskrivelse">
            <h3>Beskrivelse</h3>
            <p className="step-description">Gi vakten en tittel og beskriv hva den går ut på.</p>
            <div>
              <label>Tittel</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Beskrivelse</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-step when-where">
            <h3>Når er vakten?</h3>
            <p className="step-description">Velg dato og klokkeslett for vakten.</p>

            <div>
              <label>Dato</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                min={new Date().toISOString().split("T")[0]}
                max={
                  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split("T")[0]
                }
              />
            </div>

            <div className="time-range-group">
              <div className="time-input-group">
                <label>Fra</label>
                <input
                  type="time"
                  list="quarter-hour-options"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="time-input"
                  required
                />
              </div>

              <div className="time-input-group">
                <label>Til</label>
                <input
                  type="time"
                  list="quarter-hour-options"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="time-input"
                  required
                />
              </div>
            </div>

            <datalist id="quarter-hour-options">
              {Array.from({ length: 24 * 4 }, (_, i) => {
                const hours = String(Math.floor(i / 4)).padStart(2, "0");
                const minutes = String((i % 4) * 15).padStart(2, "0");
                return (
                  <option key={`${hours}:${minutes}`} value={`${hours}:${minutes}`} />
                );
              })}
            </datalist>
          </div>

          <div className="form-step">
            <h3>Kvalifikasjoner</h3>
            <p className="step-description">Velg hvilke kvalifikasjoner som kreves for vakten.</p>

            <div className="qualification-cards">
              {qualifications.map((qualification) => {
                const isSelected = selectedQualifications.includes(qualification.qualification_id);

                return (
                  <div
                    key={qualification.qualification_id}
                    className={`qualification-card ${isSelected ? "selected" : ""}`}
                    onClick={() => handleQualificationChange(qualification.qualification_id)}
                  >
                    <h4>{qualification.name}</h4>
                    {isSelected && <span className="checkmark">✔</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Oppretter..." : "Opprett vakt"}
        </button>
      </form>

      {showConfirmModal && (
        <CreateShiftConfirmModal
          shiftData={pendingShiftData}
          onCancel={() => setShowConfirmModal(false)}
          onConfirm={confirmCreateShift}
        />
      )}
    </div>
  );
};

export default CreateShift;
