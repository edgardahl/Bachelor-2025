import React, { useState, useEffect } from "react";
import axios from "../../../api/axiosInstance";
import useAuth from "../../../context/UseAuth";
import BackButton from "../../../components/BackButton/BackButton";
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

  const generateTimeOptions = () => {
    const options = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) {
        const hour = h.toString().padStart(2, "0");
        const minute = m.toString().padStart(2, "0");
        options.push(`${hour}:${minute}`);
      }
    }
    return options;
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
      <BackButton />
      <h1>Ny vakt</h1>
      <form onSubmit={handleSubmit}>
        <div className="create-shift-form">
          <div className="form-step when-where">
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
                list="quarter-hour-options"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="time-input"
                required
              />
            </div>

            <div>
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

            <datalist id="quarter-hour-options">
              {Array.from({ length: 24 * 4 }, (_, i) => {
                const hours = String(Math.floor(i / 4)).padStart(2, "0");
                const minutes = String((i % 4) * 15).padStart(2, "0");
                return (
                  <option
                    key={`${hours}:${minutes}`}
                    value={`${hours}:${minutes}`}
                  />
                );
              })}
            </datalist>
          </div>

          <div className="form-step">
            <h3>Steg 2: Kvalifikasjoner</h3>
            <div className="kvalifikasjoner">
              {qualifications.map((qualification) => (
                <div
                  className="kvalifikasjon-input"
                  key={qualification.qualification_id}
                >
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
                  <label
                    htmlFor={`qualification-${qualification.qualification_id}`}
                  >
                    {qualification.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="form-step beskrivelse">
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
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Oppretter..." : "Opprett vakt"}
        </button>
      </form>
    </div>
  );
};

export default CreateShift;
