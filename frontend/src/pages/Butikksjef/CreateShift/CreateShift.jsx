import React, { useState, useEffect, useRef } from "react";
import axios from "../../../api/axiosInstance";
import useAuth from "../../../context/UseAuth";
import BackButton from "../../../components/BackButton/BackButton";
import { toast } from "react-toastify";
import CreateShiftConfirmModal from "../../../components/createShiftConfirmModal/createShiftConfirmModal";
import { useNavigate } from "react-router-dom"; // ✅ Added
import "./CreateShift.css";

const CreateShift = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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
  const [errors, setErrors] = useState({});

  const fieldRefs = {
    title: useRef(null),
    description: useRef(null),
    date: useRef(null),
    start_time: useRef(null),
    end_time: useRef(null),
  };

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
        toast.error("Feil ved henting av kvalifikasjoner.");
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
    setErrors({}); // Reset errors

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
    setErrors({}); // Reset errors before submit

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
      navigate("/bs/vakter");
    } catch (error) {
      const backendErrors = error.response?.data?.error;

      if (backendErrors && typeof backendErrors === "object") {
        setErrors(backendErrors);

        // Scroll to first field with error
        const firstErrorField = Object.keys(fieldRefs).find(
          (key) => backendErrors[key]
        );
        if (firstErrorField && fieldRefs[firstErrorField].current) {
          fieldRefs[firstErrorField].current.scrollIntoView({ behavior: "smooth", block: "center" });
          fieldRefs[firstErrorField].current.focus();
        }

        toast.error("Vennligst rett opp i feilene.");
      } else {
        toast.error("Kunne ikke opprette vakt. Prøv igjen.");
      }
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
                ref={fieldRefs.title}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={errors.title ? "error" : ""}
                required
              />
              {errors.title && <div className="new-user-error-message">{errors.title}</div>}
            </div>
            <div>
              <label>Beskrivelse</label>
              <textarea
                ref={fieldRefs.description}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={errors.description ? "error" : ""}
                required
              />
              {errors.description && <div className="new-user-error-message">{errors.description}</div>}
            </div>
          </div>

          <div className="form-step when-where">
            <h3>Når er vakten?</h3>
            <p className="step-description">Velg dato og klokkeslett for vakten.</p>

            <div>
              <label>Dato</label>
              <input
                type="date"
                ref={fieldRefs.date}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={errors.date ? "error" : ""}
                required
                min={new Date().toISOString().split("T")[0]}
                max={
                  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split("T")[0]
                }
              />
              {errors.date && <div className="new-user-error-message">{errors.date}</div>}
            </div>

            <div className="time-range-group">
              <div className="time-input-group">
                <label>Fra</label>
                <input
                  type="time"
                  ref={fieldRefs.start_time}
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={`time-input ${errors.start_time ? "error" : ""}`}
                  required
                />
                {errors.start_time && <div className="new-user-error-message">{errors.start_time}</div>}
              </div>

              <div className="time-input-group">
                <label>Til</label>
                <input
                  type="time"
                  ref={fieldRefs.end_time}
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className={`time-input ${errors.end_time ? "error" : ""}`}
                  required
                />
                {errors.end_time && <div className="new-user-error-message">{errors.end_time}</div>}
              </div>
            </div>
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

        {errors.general && <div className="new-user-error-message">{errors.general}</div>}

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
