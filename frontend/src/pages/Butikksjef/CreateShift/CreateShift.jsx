import React, { useState, useEffect } from "react";
import axios from "../../../api/axiosInstance";
import useAuth from "../../../context/UseAuth";
import { toast } from "react-toastify";
import "./CreateShift.css";

const CreateShift = () => {
  const { user } = useAuth();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const shiftData = {
      title,
      description,
      date,
      start_time: startTime,
      end_time: endTime,
      store_id: StoreId,
      posted_by: UserId,
      qualifications: selectedQualifications,
    };

    try {
      await axios.post("/shifts", shiftData);
      toast.success("Vakt opprettet");

      // Reset form
      setDate("");
      setStartTime("");
      setEndTime("");
      setTitle("");
      setDescription("");
      setSelectedQualifications([]);
    } catch (error) {
      console.error("Feil ved oppretting av vakt:", error);
      toast.error("Kunne ikke opprette vakt. Prøv igjen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-shift-container">
      <h2>Ny vakt</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-step">
          <h3>Steg 1: Hvor og når?</h3>
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
          <div>
            <label>Fra</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Til</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-step">
          <h3>Steg 2: Kvalifikasjoner</h3>
          <div>
            {qualifications.map((qualification) => (
              <div key={qualification.qualification_id}>
                <input
                  type="checkbox"
                  id={`qualification-${qualification.qualification_id}`}
                  value={qualification.qualification_id}
                  checked={selectedQualifications.includes(
                    qualification.qualification_id
                  )}
                  onChange={() =>
                    handleQualificationChange(qualification.qualification_id)
                  }
                />
                <label htmlFor={`qualification-${qualification.qualification_id}`}>
                  {qualification.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="form-step">
          <h3>Steg 3: Beskrivelse</h3>
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

        <button type="submit" disabled={loading}>
          {loading ? "Oppretter..." : "Opprett vakt"}
        </button>
      </form>
    </div>
  );
};

export default CreateShift;
